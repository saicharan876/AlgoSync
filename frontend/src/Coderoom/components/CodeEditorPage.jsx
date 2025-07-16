import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

import Client from "./Client";
import Editor from "./CoderoomEditor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";

// Supported languages
const LANGUAGES = [
  "python3", "java", "cpp", "nodejs", "c", "ruby", "go", "scala",
  "bash", "sql", "pascal", "csharp", "php", "swift", "rust", "r",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");

  const codeRef = useRef(null);
  const socketRef = useRef(null);
  const socketListenersRef = useRef({});

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const usernameFromParent = location.state?.state?.username;
  const usernameDirect = location.state?.username;
  const finalUsername = usernameFromParent || usernameDirect;

  useEffect(() => {
    let isMounted = true;
    const currentListeners = socketListenersRef.current;

    const handleErrors = (err) => {
      toast.error("Socket connection failed. Try again later.");
      navigate("/chatroom");
    };

    const init = async () => {
      try {
        const socket = await initSocket();
        if (!isMounted) return;

        socketRef.current = socket;

        socket.on("connect_error", handleErrors);
        socket.on("connect_failed", handleErrors);

        socket.emit(ACTIONS.JOIN, {
          roomId,
          username: finalUsername,
        });

        currentListeners[ACTIONS.JOINED] = ({ clients, username, socketId }) => {
          if (username !== finalUsername) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socket.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        };

        currentListeners[ACTIONS.DISCONNECTED] = ({ socketId, username }) => {
          toast.success(`${username} left the room`);
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        };

        socket.on(ACTIONS.JOINED, currentListeners[ACTIONS.JOINED]);
        socket.on(ACTIONS.DISCONNECTED, currentListeners[ACTIONS.DISCONNECTED]);
      } catch (err) {
        handleErrors(err);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        Object.entries(currentListeners).forEach(([event, handler]) => {
          socketRef.current.off(event, handler);
        });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, finalUsername, navigate]);

  
  if (!location.state) {
    return <Navigate to="/chatroom" replace />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch (error) {
      toast.error("Failed to copy Room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/chatroom");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5000/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen((prev) => !prev);
  };

  return (
    <div>
      {/* Sidebar */}
      <div>
        <img src="/images/codecast.png" alt="Logo" />
        <p>Room ID: {roomId}</p>
        <button onClick={copyRoomId}>Copy Room ID</button>
        <button onClick={leaveRoom}>Leave Room</button>
        <div>
          <p>Members:</p>
          {clients.map((client) => (
            <Client key={client.socketId} username={client.username} />
          ))}
        </div>
      </div>

      {/* Editor + Language */}
      <div>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>

      {/* Compiler Toggle */}
      <button onClick={toggleCompileWindow}>
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compiler Output */}
      {isCompileWindowOpen && (
        <div style={{ backgroundColor: "#222", color: "#fff", padding: "1rem" }}>
          <div>
            <span>Compiler Output ({selectedLanguage})</span>
            <button onClick={runCode} disabled={isCompiling}>
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
          </div>
          <pre>{output || "Output will appear here after compilation"}</pre>
        </div>
      )}
    </div>
  );
}

export default EditorPage;
