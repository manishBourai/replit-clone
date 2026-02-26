import { useEffect, useState } from "react"
import axios from "axios"
import { socket } from "../App"

const SideScreen = () => {
    const [files, setFiles]=useState<[]|null>(null)
    const [ code ,setCode]=useState<any>(null)
    
    async function axiosF() {
         const response = await axios.get("http://localhost:3000/file",{params:{name:"first"}})
         console.log(response);
         
         setFiles(response.data.data)
         
    }
    useEffect(()=>{
       axiosF()
    },[])
    useEffect(()=>{
      socket.on("file",(data)=>{
        console.log(data);
        
        setCode(data)
      })
    },[])
    function handelGetCode(file:string) {
      socket.emit("getFileContent",{file})
    }
  return (
    <>
    <div>
      {files?.map((e)=>(
        <div id={e} >
          <button onClick={()=>handelGetCode(e)}>{e}</button> <br /></div>
        
      ))}
    </div>
    <div >
      {code}
    </div>
      </>
  )
}

export default SideScreen
