import { Terminal } from "@xterm/xterm";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import "@xterm/xterm/css/xterm.css";
import { io } from "socket.io-client";
import SideScreen from "../component/SideScreen";
import { useParams } from "react-router-dom";

export const socket = io("http://localhost:3000", {
  query: { roomId:"first" },
});

function Playground() {
  
  const {name} = useParams()
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);

  const [terminalHeight, setTerminalHeight] = useState(220);

  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(220);

  /* ---------------- SOCKET ---------------- */

  useEffect(() => {
    const handleMessage = (data: any) => {
      terminalRef.current?.write(JSON.parse(data));
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []);

  /* ---------------- TERMINAL INIT ---------------- */

  useEffect(() => {
    if (!terminalContainerRef.current) return;
    if (terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#000000",
      },
    });

    terminalRef.current = term;

    term.open(terminalContainerRef.current);

    term.onKey((e) => {
      socket.emit("message", { data: e.key });
    });

    return () => {
      term.dispose();
    };
  }, []);

  /* ---------------- RESIZE ---------------- */

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const delta = startYRef.current - e.clientY;
      const next = startHeightRef.current + delta;

      const min = 140;
      const max = Math.floor(window.innerHeight * 0.8);

      setTerminalHeight(Math.max(min, Math.min(max, next)));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function handleResizeStart(e: ReactMouseEvent<HTMLDivElement>) {
    e.preventDefault();

    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = terminalHeight;

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="h-screen flex flex-col bg-zinc-900">
      
      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        <SideScreen />
      </div>

      {/* Drag bar */}
      <div
        className="h-1 w-full cursor-row-resize bg-zinc-700 hover:bg-zinc-500"
        onMouseDown={handleResizeStart}
      />

      {/* Terminal */}
      <div
        style={{ height: terminalHeight }}
        className="w-full bg-black "
      >
        <div
          ref={terminalContainerRef}
          className="w-full h-full p-2"
        />
      </div>

    </div>
  );
}

export default Playground;    