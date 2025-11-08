import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

import Client from "./Client";
import Editor from "./CoderoomEditor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import './CodeEditorPage.css';

// small debounce helper
function debounce(fn, ms = 800) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

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

  // AI state
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // refs
  const codeRef = useRef(""); // current editor code
  const socketRef = useRef(null); // single socket instance
  const socketListenersRef = useRef({}); // keep handlers so we can remove them
  const aiPromptRef = useRef(null); // ref to the AI prompt textarea

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const usernameFromParent = location.state?.state?.username;
  const usernameDirect = location.state?.username;
  const finalUsername = usernameFromParent || usernameDirect;

  // helper: emit AI request over socket (room)
  const emitAiRequestSocket = ({ prompt, code, purpose = "explain" }) => {
    if (!socketRef.current || !socketRef.current.connected) {
      setAiError("Socket not connected");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    socketRef.current.emit(ACTIONS.AI_REQUEST, {
      roomId,
      prompt,
      code,
      purpose,
    });
  };

  // helper: call AI via REST (one-off)
  const callAiRest = useCallback(async ({ prompt, code, purpose = "explain" }) => {
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_ORIGIN || ""}/api/ai/ask`, {
        prompt,
        code,
        purpose,
      });
      const answer = res.data.answer || JSON.stringify(res.data);
      setAiAnswer(answer);
      setAiLoading(false);
      return answer;
    } catch (err) {
      console.error("AI REST error:", err?.response?.data || err.message);
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || "AI failed";
      setAiError(msg);
      setAiLoading(false);
      throw err;
    }
  }, []);

  // Debounced REST wrapper to avoid spamming backend
  const debouncedCallAiRestRef = useRef(null);
  if (!debouncedCallAiRestRef.current) {
    debouncedCallAiRestRef.current = debounce(async (payload) => {
      try {
        await callAiRest(payload);
      } catch (e) {
        // already handled inside callAiRest
      }
    }, 900);
  }
  const debouncedCallAiRest = debouncedCallAiRestRef.current;

  useEffect(() => {
    if (!location.state) return; // if no state, we won't init

    let isMounted = true;
    const currentListeners = socketListenersRef.current;

    const handleErrors = (err) => {
      console.error("Socket connection error:", err);
      if (!isMounted) return;
      toast.error("Socket connection failed. Try again later.");
      navigate("/chatroom");
    };

    const init = async () => {
      try {
        // reuse existing socket if already created by another component
        let socket = socketRef.current;
        if (!socket || !socket.connected) {
          socket = await initSocket(); // initSocket should be idempotent and return shared instance
          socketRef.current = socket;
        }

        if (!isMounted) return;

        // ensure we don't re-attach handlers if they already exist
        if (!currentListeners._attached) {
          // AI_RESPONSE handler
          currentListeners[ACTIONS.AI_RESPONSE] = (payload) => {
            // payload shape: { socketId, status, answer, error }
            if (!isMounted) return;
            if (payload.status === "started") {
              setAiLoading(true);
              return;
            }
            if (payload.status === "done") {
              setAiAnswer(payload.answer || "");
              setAiLoading(false);
              setAiError(null);
              return;
            }
            if (payload.status === "error") {
              setAiError(payload.error || "AI error");
              setAiLoading(false);
              return;
            }
          };

          // JOINED handler
          currentListeners[ACTIONS.JOINED] = ({ clients, username, socketId }) => {
            if (!isMounted) return;
            if (username && username !== finalUsername) toast.success(`${username} joined the room.`);
            setClients(clients || []);
            // sync code to the newly joined client
            try {
              socketRef.current.emit(ACTIONS.SYNC_CODE, {
                code: typeof codeRef.current === "string" ? codeRef.current : "",
                socketId,
              });
            } catch (e) {
              console.warn("Failed to SYNC_CODE", e);
            }
          };

          // DISCONNECTED handler
          currentListeners[ACTIONS.DISCONNECTED] = ({ socketId, username }) => {
            if (!isMounted) return;
            if (username) toast.success(`${username} left the room`);
            setClients(prev => prev.filter(c => c.socketId !== socketId));
          };

          // attach handlers once
          socket.on(ACTIONS.AI_RESPONSE, currentListeners[ACTIONS.AI_RESPONSE]);
          socket.on(ACTIONS.JOINED, currentListeners[ACTIONS.JOINED]);
          socket.on(ACTIONS.DISCONNECTED, currentListeners[ACTIONS.DISCONNECTED]);

          // attach generic socket error/log handlers (only once)
          socket.on("connect_error", handleErrors);
          socket.on("error", (err) => console.error("Socket error:", err));

          currentListeners._attached = true;
        }

        // emit JOIN after handlers attached
        socket.emit(ACTIONS.JOIN, {
          roomId,
          username: finalUsername,
        });
      } catch (err) {
        handleErrors(err);
      }
    };

    init();

    return () => {
      isMounted = false;
      // remove only attached handlers (do not disconnect global socket)
      const socket = socketRef.current;
      if (socket && socket.connected && currentListeners._attached) {
        try {
          socket.off(ACTIONS.AI_RESPONSE, currentListeners[ACTIONS.AI_RESPONSE]);
          socket.off(ACTIONS.JOINED, currentListeners[ACTIONS.JOINED]);
          socket.off(ACTIONS.DISCONNECTED, currentListeners[ACTIONS.DISCONNECTED]);
          socket.off("connect_error", handleErrors);
          socket.off("error");
        } catch (e) {
          console.warn("Error removing socket handlers:", e);
        }
        // keep socket running for other pages - do not call socket.disconnect() here
        currentListeners._attached = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, finalUsername, navigate, location.state]);

  if (!location.state) return <Navigate to="/chatroom" replace />;

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Failed to copy Room ID");
    }
  };

  const leaveRoom = () => navigate("/chatroom");

  // run code -> compile endpoint, show aiSuggestion if returned
  const runCode = async () => {
    setIsCompiling(true);
    setOutput("");
    setAiAnswer("");
    setAiError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ORIGIN || ""}/compile`, {
        code: codeRef.current,
        language: selectedLanguage,
      });

      // if backend returns structured output and aiSuggestion, handle both:
      const data = response.data;
      if (data.aiSuggestion) {
        // Show AI suggestion prominently
        setAiAnswer(data.aiSuggestion);
        setOutput(data.output || "Compiler output available (see AI suggestion).");
      } else if (data.output) {
        setOutput(typeof data.output === "string" ? data.output : JSON.stringify(data.output, null, 2));
      } else {
        setOutput(JSON.stringify(data));
      }
    } catch (err) {
      // If server returned error object, display it and possibly AI suggestion included in body
      const body = err?.response?.data;
      if (body?.aiSuggestion) {
        setAiAnswer(body.aiSuggestion);
        setOutput(body.output || body.compileError || "Compile error — AI suggested a fix.");
      } else {
        setOutput(body?.error || "An error occurred");
      }
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => setIsCompileWindowOpen(prev => !prev);

  // UI handlers for AI
  const handleAskAiRest = () => {
    const prompt = aiPromptRef.current?.value?.trim();
    if (!prompt) return toast.error("Enter a prompt");
    debouncedCallAiRest({ prompt, code: codeRef.current, purpose: "explain" });
  };

  const handleAskAiSocket = () => {
    const prompt = aiPromptRef.current?.value?.trim();
    if (!prompt) return toast.error("Enter a prompt");
    emitAiRequestSocket({ prompt, code: codeRef.current, purpose: "fix" });
  };

  return (
    <div className="code-editor">
      {/* Sidebar */}
      <div className="sidebar">
        <img src="/images/codecast.png" alt="Logo" />
        <p>Room ID: {roomId}</p>
        <button onClick={copyRoomId}>Copy Room ID</button>
        <button onClick={leaveRoom}>Leave Room</button>
        <div className="client-list">
          <p>Members:</p>
          {clients.map(client => (
            <Client key={client.socketId} username={client.username} />
          ))}
        </div>
      </div>

      {/* Editor + AI panel */}
      <div className="editor-area" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <div className="editor-container">
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={code => { codeRef.current = code ?? ""; }}
            />
          </div>
        </div>

        {/* Simple AI panel */}
        <div className="ai-panel" style={{ width: 360 }}>
          <h4 style={{ margin: 0 }}>AI Assistant</h4>

          <textarea
            ref={aiPromptRef}
            placeholder="Ask the AI (explain, fix, refactor)..."
            style={{ width: "100%", minHeight: 80 }}
          />

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={handleAskAiRest} disabled={aiLoading}>
              Ask (REST)
            </button>

            <button onClick={handleAskAiSocket} disabled={aiLoading || !roomId}>
              Ask (Room)
            </button>

            <button
              onClick={() => {
                const quick = "Write unit tests for the current code";
                aiPromptRef.current.value = quick;
                debouncedCallAiRest({ prompt: quick, code: codeRef.current, purpose: "tests" });
              }}
            >
              Quick: Write tests
            </button>
          </div>

          {aiLoading && <div style={{ marginTop: 8 }}>AI is thinking…</div>}
          {aiError && <div style={{ marginTop: 8, color: "crimson" }}>{aiError}</div>}

          {aiAnswer && (
            <div style={{ marginTop: 12 }}>
              <strong>AI Answer</strong>
              <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 8, borderRadius: 6 }}>
                {aiAnswer}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Compiler Toggle */}
      <button className="vertical-label" onClick={toggleCompileWindow}>
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler "}
      </button>

      {/* Compiler Output */}
      {isCompileWindowOpen && (
        <div className="compiler-window">
          <div style={{ display: "flex", justifyContent: "space-between', alignItems: 'center" }}>
            <span>Compiler Output ({selectedLanguage})</span>
            <div>
              <button onClick={runCode} disabled={isCompiling}>
                {isCompiling ? "Compiling..." : "Run Code"}
              </button>
            </div>
          </div>

          <pre style={{ marginTop: 8, maxHeight: 300, overflow: "auto" }}>
            {output || "Output will appear here after compilation"}
          </pre>

          {/* If AI suggested a fix after compile, show it here as well */}
          {aiAnswer && (
            <div style={{ marginTop: 12 }}>
              <strong>AI Suggested Fix</strong>
              <pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: 8, borderRadius: 6 }}>
                {aiAnswer}
              </pre>
              <div style={{ marginTop: 6 }}>
                <button onClick={() => {
                  // overwrite the editor buffer (Editor should pick up codeRef change via your implementation)
                  codeRef.current = aiAnswer;
                  toast.success("AI suggestion copied to editor buffer (paste into editor if needed).");
                }}>
                  Use AI Suggestion
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EditorPage;
