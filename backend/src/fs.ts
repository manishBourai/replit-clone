import fs from "fs"
import path from "path";



type FileNode = {
  name: string;
  type: "file" | "folder";
  path: string
};

export function createFolder(data:string) {
        fs.mkdirSync(data, { recursive: true });
  
}

export function deleteFile(file: string) {
    fs.unlinkSync(file);
}

export function createFile(file: string) {
    fs.writeFileSync(file, "");
}
export function updateFile({file,data}:{file:string,data:string}) {
  console.log(data,file);
  try {
    fs.writeFileSync(file, data); 
  } catch (error) {
    console.error("somthing went wrong");
    
  } 
}

export function getFileContent(file: string) {
   try {
     return fs.readFileSync(file, "utf-8");
   } catch (error) {
    console.error("somthing went wrong")
   }
}

export function buildFileTree(dirPath: string): FileNode[] {
  console.log(dirPath);
  
  try {
    const files = fs.readdirSync(dirPath);
    return files.map((file) => {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        return {
          name: file,
          type: "folder",
          path:`${dirPath}/${file}`
        };
      }
      return {
        name: file,
        type: "file",
        path:`${dirPath}/${file}`
      };
    });
  } catch (error) {
    console.error("Error building file tree:", error);
    return [];
  }
}
export  function deleteFolder(path:string){
  try {
  fs.rmSync(path, { recursive: true, force: true });
  console.log(`Directory ${path} and its contents deleted synchronously.`);
} catch (err) {
  console.error(`Error deleting directory synchronously: ${err}`);
}
}
