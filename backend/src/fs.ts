import fs from "fs"
import path from "path";



type FileNode = {
  name: string;
  type: "file" | "folder";
  path: string
};

export function createFolder(data: string[]) {
    data.forEach(e => {
        fs.mkdirSync(e, { recursive: true });
    });
}

export function deleteFile(file: string) {
    fs.unlinkSync(file);
}

export function createFile(file: string) {
    fs.writeFileSync(file, "");
}

export function getFileContent(file: string) {
    return fs.readFileSync(file, "utf-8");
}

export function buildFileTree(dirPath: string): FileNode[] {
  console.log(dirPath);
  
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
}
