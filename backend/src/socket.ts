import { spawn } from "node-pty";
import { Server, Socket } from "socket.io";
import os from "os"
import { buildFileTree, createFile, createFolder, deleteFile, deleteFolder, getFileContent, updateFile } from "./fs.js";
import path from "path";


export default function socket(httpServer:any) {
    const io = new Server(httpServer,{
     cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
})

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
io.on("connection", (socket:Socket) => {
   const replId= socket.handshake.query.roomId
    const ptyProcess = spawn(shell, [],{
        name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: path.join(process.cwd(),`./temp/code/${replId}`)
    });
   

socket.on("message",({data})=>{
    ptyProcess.write(data)
})
 ptyProcess.onData( (data:any) => {
    socket.send(JSON.stringify(data));
  });

  socket.on("getFileContent",async(name, callback)=>{
    console.log(name);
    const response = getFileContent(name)
    callback(response)
  })
  
    socket.on("file:tree", () => {
      console.log(replId);
      
    const tree = buildFileTree(`./temp/code/${replId}`);
    socket.emit("file:tree", tree);
  });

  socket.on("getFolder",(path:string, callback)=>{
    const res= buildFileTree(path)
    callback(res)
  })
  socket.on("createFile",({path},callback)=>{
   console.log(path);
    createFile(path)
      const res= buildFileTree(`./temp/code/${replId}`);
   callback(res)
  })
  socket.on("createFolder",({path},callback)=>{
    createFolder(path)
      const res= buildFileTree(`./temp/code/${replId}`);
   callback(res)
  })
  socket.on("updateFile",({file,data}:{file:string,data:string})=>{
    updateFile({file,data})
  })
  socket.on("delete",({path,type},callback)=>{
    console.log(path);
    if(type==="folder"){
      deleteFolder(path)
    }else{
      deleteFile(path)
    }
   const res= buildFileTree(`./temp/code/${replId}`);
   callback(res)
  })

});


}
