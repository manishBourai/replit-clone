export type FileNode = {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
}

function FileTree({
  nodes,
  onClick,
  onDelete
}: {
  nodes: FileNode[]
  onClick: (node: FileNode) => void
  onDelete: (node: FileNode) => void
}) {
  return (
    <div className="pl-2">
      {nodes.map((node) => (
        <div key={node.path}>
          <div className="flex items-center justify-between hover:bg-zinc-700 px-2 py-1 text-sm group">

            {/* File / Folder */}
            <span
              onClick={() => onClick(node)}
              className="cursor-pointer flex-1"
            >
              {node.type === "folder" ? "📁" : "📄"} {node.name}
            </span>

            {/* Delete Icon */}
            <button
              onClick={() => onDelete(node)}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-2"
            >
              🗑
            </button>

          </div>

          {node.children && node.children.length > 0 && (
            <FileTree
              nodes={node.children}
              onClick={onClick}
              onDelete={onDelete}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default FileTree