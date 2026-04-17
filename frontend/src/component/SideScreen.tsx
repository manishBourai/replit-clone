import { useEffect, useMemo, useState } from "react"
import CodeBox from "./CodeBox"
import FIleTree, { type FileNode } from "./FileTree"
import { useSocket } from "../context/SocketContext"
import { useParams } from "react-router-dom"
import { buildTree } from "../util/buildTree"

const SideScreen = () => {
  const socket = useSocket()
  const { name } = useParams()
  const projectRoot = useMemo(() => `./temp/code/${name}`, [name])
  const [code, setCode] = useState<string>("")
  const [, setFlatFiles] = useState<FileNode[]>([])
  const [fileTree, setFileTree] = useState<FileNode[] | null>(null)
  const [currenPath, setCurrentPath] = useState<string>(projectRoot)
  const [currentPathType, setCurrentPathType] = useState<"file" | "folder">("folder")
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)

  function handleGetFileTree() {
    if (socket && socket.connected) {
      socket.emit("file:tree", { data: "load" })
    }
  }

  function getBasePath(nodePath: string, nodeType: "file" | "folder") {
    if (nodeType === "folder") {
      return nodePath
    }

    const lastSlashIndex = nodePath.lastIndexOf("/")
    return lastSlashIndex >= 0 ? nodePath.slice(0, lastSlashIndex) : projectRoot
  }

  useEffect(() => {
    if (!socket) {
      return
    }

    const handleFileTree = (data: FileNode[]) => {
      setFlatFiles(data)
      setFileTree(buildTree(data, projectRoot) ?? [])
    }

    const handleConnect = () => {
      handleGetFileTree()
    }

    socket.on("file:tree", handleFileTree)
    socket.on("connect", handleConnect)

    const retryTimer = window.setInterval(() => {
      if (socket.connected && fileTree === null) {
        handleGetFileTree()
        return
      }

      window.clearInterval(retryTimer)
    }, 1000)

    return () => {
      window.clearInterval(retryTimer)
      socket.off("file:tree", handleFileTree)
      socket.off("connect", handleConnect)
    }
  }, [fileTree, projectRoot, socket])

  useEffect(() => {
    setCurrentPath(projectRoot)
    setCurrentPathType("folder")
    setCode("")
  }, [])

  function mergeFiles(nextFiles: FileNode[]) {
    setFlatFiles((previousFiles) => {
      const merged = [...previousFiles, ...nextFiles].filter((item, index, self) => (
        index === self.findIndex((current) => current.path === item.path)
      ))

      setFileTree(buildTree(merged, projectRoot) ?? [])
      return merged
    })
  }

  function removeFiles(targetPath: string, targetType: "file" | "folder", nextFiles: FileNode[]) {
    setFlatFiles((previousFiles) => {
      const filtered = previousFiles.filter((item) => {
        if (item.path === targetPath) {
          return false
        }

        if (targetType === "folder" && item.path.startsWith(`${targetPath}/`)) {
          return false
        }

        return true
      })

      const merged = [...filtered, ...nextFiles].filter((item, index, self) => (
        index === self.findIndex((current) => current.path === item.path)
      ))

      setFileTree(buildTree(merged, projectRoot) ?? [])
      return merged
    })
  }

  async function handleContent(data: FileNode) {
    if (!socket) return

    if (data.type === "folder") {
      setCurrentPath(data.path)
      setCurrentPathType("folder")
      socket.emit("getFolder", data.path, (folderEntries: FileNode[]) => {
        mergeFiles(folderEntries)
      })
    } else {
      const filePath = data.path
      setCurrentPath(filePath)
      setCurrentPathType("file")
      socket.emit("getFileContent", filePath, (content: string | null) => {
        setCode(content ?? "")
      })
    }
  }

  function handleCreateFile() {
     if (!socket) return

    const fileName = prompt("Enter file name")
    if (!fileName) return

    const basePath = getBasePath(currenPath, currentPathType)
    const path = `${basePath}/${fileName}`

    socket.emit("createFile", {
      path
    }, (data: FileNode[]) => {
      mergeFiles([
        ...data,
        {
          name: fileName,
          type: "file",
          path,
        },
      ])
    })
  }

  function handleCreateFolder() {
    if (!socket) return

    const folderName = prompt("Enter folder name")

    if (!folderName) return
    const basePath = getBasePath(currenPath, currentPathType)
    const path = `${basePath}/${folderName}`

    socket.emit("createFolder", {
      path
    }, (data: FileNode[]) => {
      mergeFiles([
        ...data,
        {
          name: folderName,
          type: "folder",
          path,
        },
      ])
    })
  }

  function handelSave(data: string) {
    if (!socket) return

    socket.emit("updateFile", { file: currenPath, data })
  }

  function handleDelete(node: FileNode) {
    if (!socket) return
    
    if (!confirm(`Delete ${node.name}?`)) return

    socket.emit("delete", { path: node.path, type: node.type }, (updatedFiles: FileNode[]) => {
      removeFiles(node.path, node.type, updatedFiles)

      if (currenPath === node.path) {
        setCurrentPath(projectRoot)
        setCurrentPathType("folder")
        setCode("")
      }
    })
  }

  const handleMouseDown = () => {
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = e.clientX
      if (newWidth > 200 && newWidth < 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div
        className="bg-bg-panel border-r border-border-primary flex flex-col"
        style={{ width: sidebarWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <span className="text-sm font-semibold text-fg-primary">Explorer</span>
          <div className="flex gap-1">
            <button
              onClick={handleCreateFile}
              className="p-1.5 text-fg-tertiary hover:text-fg-primary hover:bg-bg-hover rounded transition-colors"
              title="New File"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={handleCreateFolder}
              className="p-1.5 text-fg-tertiary hover:text-fg-primary hover:bg-bg-hover rounded transition-colors"
              title="New Folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto">
          {!fileTree ? (
            <div className="p-4 text-center text-fg-tertiary text-sm">
              <p>Loading files...</p>
            </div>
          ) : fileTree.length === 0 ? (
            <div className="p-4 text-center text-fg-tertiary text-sm">
              <p>No files yet</p>
            </div>
          ) : (
            <FIleTree
              nodes={fileTree}
              onClick={handleContent}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="w-1 bg-border-primary hover:bg-border-focus cursor-col-resize transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* Editor Area */}
      <div className="flex-1 bg-bg-primary">
        <CodeBox data={code} onClick={handelSave} />
      </div>
    </div>
  )
}

export default SideScreen
