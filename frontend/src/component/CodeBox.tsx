import { useEffect, useRef } from "react";

type CodeBoxProps = {
  data?: string;
  onClick:(data:any)=>void
};

const CodeBox = ({ data = "", onClick }: CodeBoxProps) => {
  const codeRef = useRef<HTMLTextAreaElement | null>(null);

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
    "<":">"
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

  // place cursor in the middle
  textarea.selectionStart = textarea.selectionEnd = start + 1;
}

  return (
    <div className="w-full h-full">
      <button className="bg-green-900 rounded-sm px-1" onClick={()=>onClick(codeRef.current?.value)}>Save</button>
     <textarea
  ref={codeRef}
  defaultValue={data}
  spellCheck={false}
  onKeyDown={(e) => handleAutoClose(e)}
  className="w-full h-full p-3 bg-neutral-900 text-white font-mono text-sm outline-none resize-none overflow-auto"
/>
    </div>
  );
};

export default CodeBox;