import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// Mural público
import MuralPage from "./pages/mural/MuralPage";

// Área administrativa (SENAI)
import AdmLoginPage from "./pages/adm/LoginPage";
import AdmDashboard from "./pages/adm/Dashboard";
import AdmVagasPage from "./pages/adm/VagasPage";
import AdmEmpresasPage from "./pages/adm/EmpresasPage";

// Área da empresa
import EmpresaLoginPage from "./pages/empresas/LoginPage";
import EmpresaDashboard from "./pages/empresas/Dashboard";
import EmpresaCreateJobPage from "./pages/empresas/CreateJobPage";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona raiz para o mural */}
        <Route path="/" element={<Navigate to="/mural" replace />} />

        {/* ── Mural público (/mural) ── */}
        <Route path="/mural" element={<><Navbar /><main className="area-main"><MuralPage /></main></>} />

        {/* ── Área administrativa (/adm) ── */}
        <Route path="/adm/login" element={<AdmLoginPage />} />
        <Route path="/adm" element={<PrivateRoute role="ADMIN"><AdmDashboard /></PrivateRoute>} />
        <Route path="/adm/vagas" element={<PrivateRoute role="ADMIN"><AdmVagasPage /></PrivateRoute>} />
        <Route path="/adm/empresas" element={<PrivateRoute role="ADMIN"><AdmEmpresasPage /></PrivateRoute>} />

        {/* ── Área da empresa (/empresas) ── */}
        <Route path="/empresas/login" element={<EmpresaLoginPage />} />
        <Route path="/empresas" element={<PrivateRoute role="COMPANY"><EmpresaDashboard /></PrivateRoute>} />
        <Route path="/empresas/vagas/nova" element={<PrivateRoute role="COMPANY"><EmpresaCreateJobPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
