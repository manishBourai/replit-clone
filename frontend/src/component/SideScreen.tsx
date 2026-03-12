import { useEffect, useState } from "react"
import CodeBox from "./CodeBox"
import FIleTree, { type FileNode } from "./FileTree"
import { socket } from "../pages/PlaygroundPage"
import { useParams } from "react-router-dom"
import { buildTree } from "../util/buildTree"

const SideScreen = () => {
    // const [files, setFiles]=useState<[]|null>(null)
      const {name} = useParams()
    const [ code ,setCode]=useState<any>(null)
    const [fileTree,setFileTree] = useState<FileNode[]|null>(null)
    const [currenPath,setCurrentPath] = useState<string>(`./temp/code/${name}`)
    const [currentFileName,setCurrentFileName]=useState<string>("")

    async function handelGetFile() {
      socket.emit("file:tree","first")
    }
    useEffect(()=>{
      //  axiosF()
      handelGetFile()
       socket.on("file:tree",(data)=>{
        console.log(data);
      setFileTree(pre=>[...(pre||[]),...data])
      
    })
    },[])
  
    async function handleContent(data:FileNode) {
  if (data.type==="folder") {
    const pathName=data.path
   
    socket.emit("getFolder",pathName,(data:any)=>{
      const res:FileNode[]= [...fileTree||[],...data]
      const fineFile= res.filter((item , index, self)=>{
       return index === self.findIndex(f => f.path === item.path)
      }) 
      
      const tree= buildTree(fineFile,`./temp/code/${name}`)
       setFileTree(tree!)
    })
  }else{
    const name=data.path
     setCurrentPath(name)
    setCurrentFileName(data.name)
    socket.emit("getFileContent",name,(code:any)=>{
      console.log(code);
      setCode(code)
    })
  }
}
function handleCreateFile() {
  const fileName = prompt("Enter file name full path");

  if (!fileName) return;
  const path= `${currenPath}/${fileName}`
  socket.emit("createFile", {
    path
  }, (data: FileNode[]) => {

    const tree = buildTree(data, `./temp/code/${name}`)
    setFileTree(tree!)
  })
}

function handleCreateFolder() {
  const folderName = prompt("Enter folder name full path")

  if (!folderName) return
const path= `${currenPath}/${folderName}`
  socket.emit("createFolder", {
    path
  }, (data: FileNode[]) => {

    const tree = buildTree(data, `./temp/code/${name}`)
    setFileTree(tree!)
  })
}
function handelSave(data:string){
  
  console.log(currenPath);
  socket.emit("updateFile",{file:currenPath,data})
}

function handleDelete(node: FileNode) {

  if (!confirm(`Delete ${node.name}?`)) return

  socket.emit("delete",{path:node.path,type:node.type}, (updatedFiles: FileNode[]) => {

    const tree = buildTree(updatedFiles, `./temp/code/${name}`)
    setFileTree(tree!)

  })
}
  return (
  <div className="flex h-full w-full bg-neutral-900 text-white">
    
    {/* File Explorer */}
    <div className="w-64 border-r border-neutral-700 flex flex-col">
  <div className="p-2 text-sm font-semibold border-b border-neutral-700 flex justify-between items-center">
  <span>Explorer</span>

  <div className="flex gap-2">
    <button
      onClick={handleCreateFile}
      className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded"
    >
      + File
    </button>

    <button
      onClick={handleCreateFolder}
      className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded"
    >
      + Folder
    </button>
  </div>
</div>

  <div className="flex-1 overflow-y-auto p-2">
    {fileTree && (
      <FIleTree nodes={fileTree} onClick={handleContent} onDelete={handleDelete} />
    )}
  </div>
</div>

    {/* Code Editor */}
    <div className="flex-1 p-4 ">
      <CodeBox data={code} onClick={handelSave} />
    </div>

  </div>
);
}

export default SideScreen
