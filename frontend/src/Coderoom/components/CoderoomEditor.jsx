import { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";
import "./CoderoomEditor.css";

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const initEditor = () => {
      if (!editorRef.current) {
        const editor = CodeMirror.fromTextArea(textareaRef.current, {
          mode: { name: "javascript", json: true },
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          theme: "default",
        });

        editor.setSize(null, "100%");
        editorRef.current = editor;

        editor.on("change", (instance, changes) => {
          const { origin } = changes;
          const code = instance.getValue();
          onCodeChange(code);

          if (origin !== "setValue") {
            socketRef.current?.emit(ACTIONS.CODE_CHANGE, { roomId, code });
          }
        });

        editor.on("cursorActivity", (instance) => {
          const cursor = instance.getCursor();
          socketRef.current?.emit(ACTIONS.CURSOR_CHANGE, { roomId, cursor });
        });
      }
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
    };
  }, [roomId, onCodeChange, socketRef]);

  useEffect(() => {
    const currentSocket = socketRef.current;

    const handleCodeChange = ({ code }) => {
      if (code !== null && editorRef.current) {
        editorRef.current.setValue(code);
      }
    };

    currentSocket?.on(ACTIONS.CODE_CHANGE, handleCodeChange);

    return () => {
      currentSocket?.off(ACTIONS.CODE_CHANGE, handleCodeChange);
    };
  }, [socketRef]);

  return (
    <div className="editor-container">
      <textarea ref={textareaRef} />
    </div>
  );
}

export default Editor;
