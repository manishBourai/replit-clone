import { useEffect, useRef } from "react";

type CodeBoxProps = {
  data?: string;
};

const CodeBox = ({ data = "" }: CodeBoxProps) => {
  const codeRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.value = data;
    }
  }, [data]);

  return (
    <div className="w-full h-full">
      <textarea
        ref={codeRef}
        defaultValue={data}
        className="w-full h-full p-3 bg-neutral-900 text-white font-mono text-sm outline-none resize-none overflow-auto"
        spellCheck={false}
      />
    </div>
  );
};

export default CodeBox;