import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ScanPage from "./pages/ScanPage"
import ResultPage from "./pages/ResultPage"
import CelebrationPage from "./pages/CelebrationPage"
import DashboardPage from "./pages/DashboardPage"



function App() {
  return (
   <Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/login" element={<LoginPage/>} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/scan" element={<ScanPage />} />
    <Route path="/results" element={<ResultPage/>} />
    <Route path="/celebration" element={<CelebrationPage/>}/>
    <Route path="/dashboard" element={<DashboardPage />} />
   </Routes>
  )
}

export default App