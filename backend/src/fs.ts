import fs from "fs"

export async function createFolder(data:[]) {
    
    data.map(e=>{
        fs.mkdirSync(e,{recursive:true})
    })
    return
}
export async function deleteFile(file:string) {
    fs.unlinkSync(file)
    return
}
export async function createFile(file:string) {
    fs.writeFileSync(file,"")
    return
}
