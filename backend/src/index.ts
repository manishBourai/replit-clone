import express, { type Request, type Response } from "express"
import {createServer} from "http"
import "dotenv/config"
import { httpInit } from "./http.js"
import socket from "./socket.js"

const app =express()
app.use(express.urlencoded({extended:true}))
app.use(express.json())
const httpServer=createServer(app)

socket(httpServer)
httpInit(app)


httpServer.listen(3000,()=>{
    console.log("Server is Running");
    
})