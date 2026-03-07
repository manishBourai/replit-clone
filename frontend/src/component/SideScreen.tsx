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
      console.log(tree);
      console.log(name);
       setFileTree(tree!)
    })
  }else{
    const name=data.path
    socket.emit("getFileContent",name,(code:any)=>{
      console.log(code);
      setCode(code)
    })
  }
}
  return (
  <div className="flex h-full w-full bg-neutral-900 text-white">
    
    {/* File Explorer */}
    <div className="w-64 border-r border-neutral-700 flex flex-col">
  <div className="p-2 text-sm font-semibold border-b border-neutral-700">
    Explorer
  </div>

  <div className="flex-1 overflow-y-auto p-2">
    {fileTree && (
      <FIleTree nodes={fileTree} onClick={handleContent} />
    )}
  </div>
</div>

    {/* Code Editor */}
    <div className="flex-1 p-4 ">
      <CodeBox data={code} />
    </div>

  </div>
);
}

export default SideScreen
