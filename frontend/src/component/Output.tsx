
const INSTANCE_URI = "http://localhost:5000";

export const Output = () => {
  return (
    <div className="h-full w-full bg-bg-primary border border-border-primary rounded-lg overflow-hidden">
      <div className="flex items-center px-4 py-2 bg-bg-secondary border-b border-border-primary">
        <span className="text-sm font-medium text-fg-primary">Output</span>
      </div>
      <iframe
        width="100%"
        height="100%"
        src={`${INSTANCE_URI}`}
        className="border-0"
        title="Output"
      />
    </div>
  );
};