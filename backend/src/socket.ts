
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
const docker = new Docker()
const rooms = new Map<string, { container: any; workspacePath: string }>();

io.on("connection", async(socket:Socket) => {
   const replId = String(socket.handshake.query.roomId ?? "default");
   const workspacePath = path.join(process.cwd(), `./temp/code/${replId}`);
   fs.mkdirSync(workspacePath, { recursive: true });
   await ensureImage(docker, "node:20-alpine");
 
   let room = rooms.get(replId);
   let container = room?.container;


   if (!container) {
      const workspacePath = path.join(process.cwd(), `./temp/code/${replId}`);
  
     try {
       container = await docker.createContainer({
         Image: "node:20-alpine",
         Tty: true,              // âœ… REQUIRED
         AttachStdin: true,
         AttachStdout: true,
         AttachStderr: true,
         OpenStdin: true,        // âœ… REQUIRED
         Cmd: ["/bin/sh","-i"],
         WorkingDir: `/${replId}`,
         HostConfig: {
           Binds: [`${workspacePath}:/${replId}`],
           Tmpfs: {
             "/tmp": "rw"
            },
           Memory: 256 * 1024 * 1024, // 256MB
           CpuShares: 512,
          //  NetworkMode: "bridge"
         },
        //  User: "node",
       });
       await container.start();
       console.log("Container started", replId);
       rooms.set(replId, { container, workspacePath });
     } catch (error:any) {
       console.log(error.message)
       return;
     }
   } else {
     try {
       const inspect = await container.inspect();
       if (!inspect.State.Running) {
         await container.start();
         console.log("Restarted container for", replId);
       }
     } catch (error:any) {
       console.log(error.message)
       return;
     }
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

socket.on("ok",(data)=>{
  console.log("data  :  " ,data);
  
})
  socket.on("getFileContent",async(name, callback)=>{
    console.log(name);
    const response = getFileContent(name)
    callback(response)
  })
  
    socket.on("file:tree", ({data}) => {
      console.log("file Tree : ",replId);
    try {
        
      const tree = buildFileTree(`./temp/code/${replId}`);
      socket.emit("file:tree", tree);
    } catch (error :any) {
      console.log(" error callback : ",error.message); 
    }
  })

  
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
          try {
            stream.destroy?.();
            // fs.rmSync(workspacePath, { recursive: true, force: true });
          } catch (err) {
            console.error("Error destroying stream:", err);
          }
          console.log("Disconnect", replId);
  });

});


}
