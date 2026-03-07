export type FileNode = {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
}

function FileTree({
  nodes,
  onClick
}: {
  nodes: FileNode[]
  onClick: (node: FileNode) => void
}) {
  return (
    <div className="pl-2">
      {nodes.map((node) => (
        <div key={node.path}>
          <div
            onClick={() => onClick(node)}
            className="cursor-pointer hover:bg-zinc-700 px-2 py-1 text-sm"
          >
            {node.type === "folder" ? "📁" : "📄"} {node.name}
          </div>

          {node.children && node.children.length > 0 && (
            <FileTree nodes={node.children} onClick={onClick} />
          )}
        </div>
      ))}
    </div>
  )
}

export default FileTree