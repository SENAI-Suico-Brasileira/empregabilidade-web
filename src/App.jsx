import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import A11yWidget from "./components/A11yWidget";

// Mural público
import MuralPage from "./pages/mural/MuralPage";

// Área administrativa (SENAI)
import AdmLoginPage from "./pages/adm/LoginPage";
import AdmDashboard from "./pages/adm/Dashboard";
import AdmVagasPage from "./pages/adm/VagasPage";
import AdmEmpresasPage from "./pages/adm/EmpresasPage";
import AdmAdminsPage from "./pages/adm/AdminsPage";
import AdmLayout from "./components/AdmLayout";

// Área da empresa
import EmpresaLoginPage from "./pages/empresas/LoginPage";
import EmpresaDashboard from "./pages/empresas/Dashboard";
import EmpresaCreateJobPage from "./pages/empresas/CreateJobPage";
import EmpresaContaPage from "./pages/empresas/ContaPage";

import "./App.css";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/mural" replace />} />

          {/* ── Mural público (/mural) ── */}
          <Route
            path="/mural"
            element={
              <>
                <Navbar />
                <main id="main-content" className="area-main">
                  <MuralPage />
                </main>
              </>
            }
          />

          {/* ── Área administrativa (/adm) ── */}
          <Route path="/adm/login" element={<AdmLoginPage />} />
          <Route element={<PrivateRoute role="ADMIN"><AdmLayout /></PrivateRoute>}>
            <Route path="/adm" element={<AdmDashboard />} />
            <Route path="/adm/vagas" element={<AdmVagasPage />} />
            <Route path="/adm/empresas" element={<AdmEmpresasPage />} />
            <Route path="/adm/admins" element={<AdmAdminsPage />} />
          </Route>

          {/* ── Área da empresa (/empresas) ── */}
          <Route path="/empresas/login" element={<EmpresaLoginPage />} />
          <Route path="/empresas" element={<PrivateRoute role="COMPANY"><EmpresaDashboard /></PrivateRoute>} />
          <Route path="/empresas/vagas/nova" element={<PrivateRoute role="COMPANY"><EmpresaCreateJobPage /></PrivateRoute>} />
          <Route path="/empresas/conta" element={<PrivateRoute role="COMPANY"><EmpresaContaPage /></PrivateRoute>} />
        </Routes>

        {/* Widget de acessibilidade disponível em todas as páginas */}
        <A11yWidget />
      </BrowserRouter>
    </AppProvider>
  );
}
