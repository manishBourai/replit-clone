import { useEffect, useRef, useState } from "react";
import { Output } from "./Output";

type CodeBoxProps = {
  data?: string;
  onClick:(data:any)=>void
};

const CodeBox = ({ data = "", onClick }: CodeBoxProps) => {
  const codeRef = useRef<HTMLTextAreaElement | null>(null);
  const [showOutput, setShowOutput] = useState<Boolean>(false);

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
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between">
        <button className="bg-green-900 rounded-sm px-1" onClick={() => onClick(codeRef.current?.value)}>Save</button>
        <button className="bg-white rounded-sm px-1 text-black" onClick={() => setShowOutput(!showOutput)}>Output</button>
      </div>
      <div className="flex flex-1 gap-4 mt-1">
        <textarea
          ref={codeRef}
          defaultValue={data}
          spellCheck={false}
          onKeyDown={(e) => handleAutoClose(e)}
          className="flex-1 p-3 bg-neutral-900 text-white font-mono text-sm outline-none resize-none overflow-auto"
        />
        {showOutput && <div className="flex-1"><Output /></div>}
      </div>
    </div>
  );
};

export default CodeBox;