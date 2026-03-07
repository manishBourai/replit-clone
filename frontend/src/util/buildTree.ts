export type FileNode = {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
}

export function buildTree(files: FileNode[], root: string) {
  const rootNode: FileNode = {
    name: "root",
    type: "folder",
    path: root,
    children: []
  }

  for (const file of files) {
    const relative = file.path.replace(root + "/", "")
    const parts = relative.split("/")

    let current = rootNode

    parts.forEach((part, index) => {
      let child = current.children!.find(n => n.name === part)

      if (!child) {
        child = {
          name: part,
          type: index === parts.length - 1 ? file.type as "file" | "folder" : "folder",
          path: current.path + "/" + part,
          children: []
        }

        current.children!.push(child)
      }

      current = child
    })
  }

  return rootNode.children
}