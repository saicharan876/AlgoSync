// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const { ACTIONS } = require("./socket/Actions");
const compileCode = require("./utils/complie.js"); 
const { callAI } = require("./utils/openai"); 

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const authRouter = require("./routers/AuthRouter.js");
const userRouter = require("./routers/UserRouter.js");
const bookmarkRouter = require("./routers/BookmarkRouter.js");
const problemRouter = require("./routers/ProblemRouter.js");
const aiRouter = require("./routers/AIrouter.js"); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/problems", problemRouter);
app.use("/api/ai", aiRouter);

app.post("/compile", async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  try {
    const output = await compileCode(code, language);

    const hasStderr =
      output &&
      (typeof output === "object") &&
      (output.stderr || output.error || (output.exitCode && output.exitCode !== 0));

    if (hasStderr) {
      try {
        const system = {
          role: "system",
          content:
            "You are an expert programming assistant. Provide concise fixes that are likely to compile. When returning code, wrap it in triple backticks and mention the language.",
        };

        const userMsg = {
          role: "user",
          content: `Language: ${language}\n\nCode:\n${code}\n\nCompiler output / error:\n${output.stderr || output.error || JSON.stringify(output)}\n\nPlease suggest a corrected version and briefly explain changes.`,
        };

        const aiSuggestion = await callAI({
          messages: [system, userMsg],
          max_tokens: 800,
        });

        return res.status(200).json({ output, aiSuggestion });
      } catch (aiErr) {
        return res.status(200).json({
          output,
          aiSuggestion: null,
          aiError: aiErr.message || String(aiErr),
        });
      }
    }

    // No errors — good compile
    return res.json({ output });
  } catch (err) {
    // compileCode threw — try to recover by asking AI for fixes
    try {
      const system = {
        role: "system",
        content:
          "You are an expert programming assistant. Provide concise fixes that are likely to compile. When returning code, wrap it in triple backticks and mention the language.",
      };

      const userMsg = {
        role: "user",
        content: `Language: ${req.body.language}\n\nCode:\n${req.body.code}\n\nCompile error/exception:\n${err.message}\n\nPlease propose a corrected version and briefly explain changes.`,
      };

      const aiSuggestion = await callAI({
        messages: [system, userMsg],
        max_tokens: 800,
      });

      return res.status(200).json({
        output: null,
        compileError: err.message,
        aiSuggestion,
      });
    } catch (aiErr) {
      return res.status(500).json({
        error: "Compilation failed and AI suggestion failed",
        compileError: err.message,
        aiError: aiErr.message || String(aiErr),
      });
    }
  }
});

/**
 * Socket.IO mapping helpers
 */
const userSocketMap = new Map(); // socket.id -> username

function getAllConnectedClients(roomId) {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];
  return Array.from(room).map((socketId) => ({
    socketId,
    username: userSocketMap.get(socketId),
  }));
}

/**
 * Socket.IO main connection
 */
io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  // Join room
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap.set(socket.id, username);
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // Code change broadcasting
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Cursor broadcasting
  socket.on(ACTIONS.CURSOR_CHANGE, ({ roomId, cursor }) => {
    socket.in(roomId).emit(ACTIONS.CURSOR_CHANGE, {
      socketId: socket.id,
      cursor,
    });
  });

  // Sync code to specific client
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.AI_REQUEST, async ({ roomId, prompt, code, purpose }) => {
    // Notify room that AI started for this socket (optional)
    io.to(roomId).emit(ACTIONS.AI_RESPONSE, {
      socketId: socket.id,
      status: "started",
    });

    try {
      const system = {
        role: "system",
        content:
          "You are an expert programming assistant. Provide concise, actionable answers. When returning code, wrap it in triple backticks and specify the language.",
      };

      let userContent = prompt || "";
      if (purpose === "fix" && code) {
        userContent = `Fix the following ${purpose || "code"} and explain the changes.\n\nCode:\n${code}\n\nExtra prompt: ${prompt || ""}`;
      } else if (purpose === "explain" && code) {
        userContent = `Explain the following code step-by-step:\n\n${code}\n\nExtra prompt: ${prompt || ""}`;
      } else if (code) {
        userContent = `${prompt || "Help with this code:"}\n\n${code}`;
      }

      const aiAnswer = await callAI({
        messages: [system, { role: "user", content: userContent }],
        max_tokens: 1000,
      });

      io.to(roomId).emit(ACTIONS.AI_RESPONSE, {
        socketId: socket.id,
        status: "done",
        answer: aiAnswer,
      });
    } catch (err) {
      console.error("AI socket error:", err);
      io.to(roomId).emit(ACTIONS.AI_RESPONSE, {
        socketId: socket.id,
        status: "error",
        error: err.message || String(err),
      });
    }
  });

  // Clean up on disconnect
  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms); // includes socket.id
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap.get(socket.id),
      });
    });
    userSocketMap.delete(socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, " reason:", reason);
    userSocketMap.delete(socket.id);
  });
});

/**
 * Start server after connecting to MongoDB
 */
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
