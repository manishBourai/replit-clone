import { spawn } from "node-pty";
import { Server, Socket } from "socket.io";
import os from "os"
import { getFile } from "./s3.js";


export default function socket(httpServer:any) {
    const io = new Server(httpServer,{
     cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
})
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
io.on("connection", (socket:Socket) => {
    const ptyProcess = spawn(shell, [],{
        name: 'xterm-color',
  cols: 80,
  rows: 30
    });

socket.on("message",({data})=>{
    ptyProcess.write(data)
})
 ptyProcess.onData( (data:any) => {
    socket.send(JSON.stringify(data));
  });
  socket.on("getFileContent",async({file})=>{
    const response = await getFile(file)
    socket.emit("file", response)
  })
});


}