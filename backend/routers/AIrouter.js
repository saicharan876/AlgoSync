const express = require("express");
const router = express.Router();
const { callAI } = require("../utils/openai");

// POST /api/ai/ask
// body: { prompt: string, code?: string, purpose?: "explain"|"fix"|"complete" }
router.post("/ask", async (req, res) => {
  const { prompt, code, purpose } = req.body;
  if (!prompt && !code) {
    return res.status(400).json({ error: "prompt or code required" });
  }

  try {
    // craft messages for the model
    const system = {
      role: "system",
      content:
        "You are a helpful programming assistant. Provide concise, correct answers and, when asked to fix code, produce compilable code snippets.",
    };

    const userMessages = [];

    if (purpose === "fix" && code) {
      userMessages.push({
        role: "user",
        content: `Fix the following code and explain the change. Code:\n\n${code}\n\nProblem / Prompt: ${prompt || "fix the code"}`,
      });
    } else if (purpose === "explain" && code) {
      userMessages.push({
        role: "user",
        content: `Explain what the following code does, step by step:\n\n${code}`,
      });
    } else {
      userMessages.push({
        role: "user",
        content: `${prompt}${code ? "\n\nCode:\n" + code : ""}`,
      });
    }

    const aiResp = await callAI({ messages: [system, ...userMessages] });

    res.json({ answer: aiResp });
  } catch (err) {
    console.error("AI error:", err.message || err);
    res.status(500).json({ error: "AI call failed", details: err.message });
  }
});

module.exports = router;
