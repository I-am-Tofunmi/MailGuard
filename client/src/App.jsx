
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ScanPage from "./pages/ScanPage";
import ResultPage from "./pages/ResultPage";
import CelebrationPage from "./pages/CelebrationPage";
import DashboardPage from "./pages/DashboardPage";
import CheckEmailPage from "./pages/CheckEmailPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/check-email" element={<CheckEmailPage />} />

      {/* Routes requiring authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/results" element={<ResultPage />} />
        <Route path="/celebration" element={<CelebrationPage />} />
      </Route>
    </Routes>
  );
}

export default App;
