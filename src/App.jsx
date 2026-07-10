import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import RequireAdmin from "./components/RequireAdmin";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
