import { Route, Routes } from "react-router-dom"
import Playground from "./pages/PlaygroundPage"
import HomePage from "./pages/HomePage"


function App() {
 
  return (
    <Routes>
      <Route path="/playground/:name" element={<Playground/>}/>
      <Route path="/" element={<HomePage/>}/>
    </Routes>
  )
}

export default App
