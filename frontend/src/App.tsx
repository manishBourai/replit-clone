
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import "../node_modules/@xterm/xterm/css/xterm.css"
import { io } from 'socket.io-client';
import SideScreen from './component/SideScreen';


const terminal = new Terminal()
export const socket= io("http://localhost:3000")
function App() {
  const terminalRef=useRef<HTMLDivElement|null>(null)
   useEffect(()=>{
    socket.on("message",(data:any)=>{
      terminal.write(JSON.parse(data))
    })
     return () => {
      socket.off("output");
    };
  },[])
  useEffect(()=>{
    if(!terminalRef.current)return
    
    terminal.open(terminalRef.current)
    terminal.onKey((e)=>{
      socket.emit("message",{data:e.key})
    })
  },[terminalRef])
 

  return (
    <>
    <SideScreen></SideScreen>
    <div className='' ref={terminalRef}>
    </div>
    </>
  )
}

export default App
