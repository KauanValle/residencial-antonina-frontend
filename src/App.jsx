import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import RegistrosPage from './pages/RegistrosPage';
import NovoRegistroPage from './pages/NovoRegistroPage';
import UsuariosPage from './pages/UsuariosPage';
import VisitantesPage from './pages/VisitantesPage';
import NovoRegistroAguaPage from './pages/NovoRegistroAguaPage';
import UpdateRegistroAguaPage from './pages/UpdateRegistroAguaPage';
import RegistroAguaPage from './pages/RegistroAguaPage';
import EncomendasPage from './pages/EncomendasPage';
import NovaEncomendaPage from './pages/NovaEncomendaPage';


function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<Navigate to="/registros" replace />} />
            <Route path="registros" element={<RegistrosPage />} />
            <Route path="registros/novo" element={<NovoRegistroPage />} />
            {/* <Route path="visitantes" element={<VisitantesPage/>}/> */}
            <Route path="registro-agua" element={<RegistroAguaPage/>} />
            <Route path="registro-agua/novo" element={<NovoRegistroAguaPage/>} />
            <Route path="registro-agua/:id/leitura-noite" element={<UpdateRegistroAguaPage />} />
            <Route path="encomendas" element={<EncomendasPage />} />
            <Route path="encomendas/nova" element={<NovaEncomendaPage />} />
            <Route path="usuarios" element={
              <PrivateRoute adminOnly><UsuariosPage /></PrivateRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
