import { Terminal } from "@xterm/xterm";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import "@xterm/xterm/css/xterm.css";
import SideScreen from "../component/SideScreen";
import { ThemeToggle } from "../component/ThemeToggle";
import { useParams } from "react-router-dom";
import { SocketProvider, useSocket } from "../context/SocketContext";

function PlaygroundContent() {
  const { name } = useParams();
  const socket = useSocket();
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);

  const [terminalHeight, setTerminalHeight] = useState(220);
  const [terminalStatus, setTerminalStatus] = useState("Connecting...");

  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(220);

  /* Socket message handler */
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleData = (data: string) => {
      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        terminalRef.current?.write(String(parsed));
        setTerminalStatus("Ready");
      } catch {
        terminalRef.current?.write(String(data));
        setTerminalStatus("Ready");
      }
    };

    const handleConnect = () => {
      setTerminalStatus("Connected");
    };

    const handleDisconnect = () => {
      setTerminalStatus("Disconnected");
    };

    const handleConnectError = () => {
      setTerminalStatus("Connection failed");
    };

    socket.on("message", handleData);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      setTerminalStatus("Connected");
    }

    return () => {
      socket.off("message", handleData);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket]);

  /* ---------------- TERMINAL INIT ---------------- */

  useEffect(() => {
    if (!terminalContainerRef.current) return;
    if (terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'var(--font-family-mono)',
      theme: {
        background: 'var(--bg-tertiary)',
        foreground: 'var(--fg-primary)',
        cursor: 'var(--fg-accent)',
      },
    });

    terminalRef.current = term;

    term.open(terminalContainerRef.current);

    term.onData((e) => {
      socket?.emit("message", e);
    });

    return () => {
      term.dispose();
      terminalRef.current = null;
    };
  }, [socket]);

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
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-elevated border-b border-border-primary">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-fg-primary">
            {name || 'Project'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        <SideScreen />
      </div>

      {/* Drag bar */}
      <div
        className="h-1 w-full cursor-row-resize bg-border-primary hover:bg-border-focus transition-colors"
        onMouseDown={handleResizeStart}
      />

      {/* Terminal Panel */}
      <div
        style={{ height: terminalHeight }}
        className="w-full bg-bg-tertiary border-t border-border-primary"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border-primary">
          <span className="text-sm font-medium text-fg-primary">Terminal</span>
          <span className="text-xs text-fg-tertiary">{terminalStatus}</span>
        </div>
        <div
          ref={terminalContainerRef}
          className="w-full h-full p-2"
        />
      </div>
    </div>
  );
}

function Playground() {
  const { name } = useParams();
  
  if (!name) {
    return <div>Loading...</div>;
  }

  return (
    <SocketProvider projectName={name}>
      <PlaygroundContent />
    </SocketProvider>
  );
}

export default Playground;
