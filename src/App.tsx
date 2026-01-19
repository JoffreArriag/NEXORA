import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardCliente from "./pages/client/DashboardCliente";

export default function App() {
  return (
    <Routes>
      {/* Autenticación */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Panel de Administrador */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Panel de Cliente */}
      <Route path="/client" element={<DashboardCliente />} />
    </Routes>
  );
}
