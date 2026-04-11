// import { spawn } from "node-pty";
import { Server, Socket } from "socket.io";
import Docker from "dockerode";
import { buildFileTree, createFile, createFolder, deleteFile, deleteFolder, getFileContent, updateFile } from "./fs.js";
import path from "path";
import fs from "fs"


export default function socket(httpServer:any) {
    const io = new Server(httpServer,{
     cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
})
const docker= new Docker()

io.on("connection", async(socket:Socket) => {
   const replId= socket.handshake.query.roomId
 

   const workspacePath=path.join(process.cwd(),`./temp/code/${replId}`)
 await ensureImage(docker, "node:20-alpine");
  let container:any;

try {
      
       container = await docker.createContainer({
            Image: "node:20-alpine",
            Tty: true,              // ✅ REQUIRED
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true,        // ✅ REQUIRED
            Cmd: ["/bin/sh","-i"],
            WorkingDir: `/${replId}`,
            HostConfig: {
              Binds: [`${workspacePath}:/${replId}`],
              ReadonlyRootfs: true,
              Memory: 256 * 1024 * 1024, // 256MB
              CpuShares: 512,
              NetworkMode: "none", // no internet (optional)
              
            },
            User: "node", // non-root user
          });
} catch (error:any) {
  socket.send(error.message)
}
        
   try {
  await container.start();
  console.log("Container started");
} catch (err) {
  console.error("START ERROR:", err);
}
    
        async function ensureImage(docker: Docker, image: string) {
      try {
        await docker.getImage(image).inspect();
      } catch {
        console.log("Pulling image:", image);
    
        const stream = await docker.pull(image);
    
        await new Promise((resolve, reject) => {
          docker.modem.followProgress(stream, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        });
      }
    }






    const exec = await container.exec({
  Cmd: ["/bin/sh"],
  AttachStdin: true,
  AttachStdout: true,
  AttachStderr: true,
  Tty: true,
});

   const stream = await exec.start({
  hijack: true,
  stdin: true,
});

    stream.on("data", (chunk:any) => {
  const output = chunk.toString("utf-8");
  console.log("OUTPUT:", output);

  if (socket.connected) {
    socket.send(JSON.stringify(output));
  }
});

socket.on("message", (data) => {
  console.log("INPUT:", data);

  try {
    stream.write(data);;
  } catch (error :any) {
    socket.emit("output", "error: " + error?.message);
  }
});




   

// socket.on("message",({data})=>{
//     ptyProcess.write(data)
// })
//  ptyProcess.onData( (data:any) => {
//     socket.send(JSON.stringify(data));
//   });

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

   socket.on("disconnect",async () => {
          await container.stop();
          await container.remove();
         fs.rmSync(workspacePath, { recursive: true, force: true });
          console.log("Disconnect");
   
  });

});


}
