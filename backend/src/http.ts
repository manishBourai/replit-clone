import { CopyS3, getFile, listProject } from "./s3.js"
import { type Express, type Request, type Response} from "express"
import Cors from "cors"

export const httpInit= ( app:Express)=>{

   app.use(Cors())

app.get("/file",async(req:Request,res:Response)=>{
   const name =req.query.name
   console.log(req.params);
   console.log(req.query.name);
   
   const response= await listProject(`temp/code/${name}`,"./temp/code")
   const data:any=response?.map((e)=>{
      return e.Key
    })
   res.status(200).json({
    data
   })
})
app.post("/create",async(req:Request,res:Response)=>{
   console.log(req.body);
   
   const {language,name}=req.body

   if (!language||!name) {
      return res.status(300).json({
         message:"Somthing Went Wrong"
      })
   }
  try {
    const response= await CopyS3(`temp/language/${language}/`,`temp/code/${name}/`)
    res.status(201).json({
       data:response
    })
  } catch (error) {
   res.status(500).json({
       data:error
    })
  }
})
app.post("/code",async (req:Request,res:Response) => {
   const { file }=req.body
   const response = await getFile(file)
    res.status(200).json({
      data:response
    })
})
app.get("/generate",(req,res)=>{
try {
      
      res.status(200).json({
      message:"ok"
     })
} catch (error) {
   return error
}
})

}