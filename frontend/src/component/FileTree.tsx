import React from 'react';

export type FileNode = {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
}

interface FileTreeNodeProps {
  node: FileNode
  level: number
  onClick: (node: FileNode) => void
  onDelete: (node: FileNode) => void
}

function FileTreeNode({ node, level, onClick, onDelete }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(level < 2)

  const handleClick = () => {
    onClick(node)
    if (node.type === "folder") {
      setIsExpanded(!isExpanded)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'jsx':
        return '🟨'
      case 'ts':
      case 'tsx':
        return '🔷'
      case 'py':
        return '🐍'
      case 'json':
        return '📄'
      case 'md':
        return '📝'
      case 'css':
        return '🎨'
      case 'html':
        return '🌐'
      default:
        return '📄'
    }
  }

  return (
    <div>
      <div
        className="flex items-center justify-between py-1 px-2 hover:bg-bg-hover cursor-pointer group rounded-sm transition-colors"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {node.type === "folder" ? (
            <>
              <svg
                className={`w-4 h-4 text-fg-tertiary transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-4 h-4 text-fg-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
            </>
          ) : (
            <>
              <span className="text-sm">{getFileIcon(node.name)}</span>
            </>
          )}
          <span className="text-sm text-fg-primary truncate">{node.name}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(node)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-fg-tertiary hover:text-red-400 rounded transition-all"
          title="Delete"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {node.children && isExpanded && (
        <FileTree
          nodes={node.children}
          onClick={onClick}
          onDelete={onDelete}
          level={level + 1}
        />
      )}
    </div>
  )
}

function FileTree({
  nodes,
  onClick,
  onDelete,
  level = 0
}: {
  nodes: FileNode[]
  onClick: (node: FileNode) => void
  onDelete: (node: FileNode) => void
  level?: number
}) {
  return (
    <div className="py-1">
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          level={level}
          onClick={onClick}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default FileTree