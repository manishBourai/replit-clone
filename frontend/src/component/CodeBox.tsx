import { useEffect, useRef, useState } from "react";
import { Output } from "./Output";

type CodeBoxProps = {
  data?: string;
  onClick: (data: any) => void
};

const CodeBox = ({ data = "", onClick }: CodeBoxProps) => {
  const codeRef = useRef<HTMLTextAreaElement | null>(null);
  const [showOutput, setShowOutput] = useState<boolean>(false);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.value = data;
    }
  }, [data]);

  function handleAutoClose(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const pairs: Record<string, string> = {
      "{": "}",
      "(": ")",
      "[": "]",
      '"': '"',
      "'": "'",
      "<": ">"
    };

    const textarea = e.currentTarget;
    const open = e.key;

    if (!pairs[open]) return;

    e.preventDefault();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const value = textarea.value;

    const newValue =
      value.substring(0, start) +
      open +
      pairs[open] +
      value.substring(end);

    textarea.value = newValue;

    textarea.selectionStart = textarea.selectionEnd = start + 1;
  }

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-elevated border-b border-border-primary">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fg-primary">Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onClick(codeRef.current?.value)}
            className="px-3 py-1.5 text-sm bg-bg-active hover:bg-bg-active/80 text-fg-primary rounded-md transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setShowOutput(!showOutput)}
            className="px-3 py-1.5 text-sm bg-bg-secondary hover:bg-bg-hover border border-border-primary text-fg-primary rounded-md transition-colors"
          >
            {showOutput ? 'Hide' : 'Show'} Output
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <textarea
            ref={codeRef}
            defaultValue={data}
            spellCheck={false}
            onKeyDown={(e) => handleAutoClose(e)}
            className="flex-1 p-4 bg-bg-secondary border border-border-primary rounded-lg text-fg-primary font-mono text-sm outline-none resize-none overflow-auto focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors"
            placeholder="Start coding..."
          />
        </div>

        {showOutput && (
          <div className="flex-1 bg-bg-secondary border border-border-primary rounded-lg overflow-hidden">
            <Output />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBox;