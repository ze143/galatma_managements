import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Banks from './pages/Banks';
import Activities from './pages/Activities';
import Setup from './pages/Setup';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import Users from './pages/Users';

function Shell() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold">جارٍ التحميل...</div>;
  if (!user) return <Login />;
  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute module="finance"><Finance /></ProtectedRoute>} />
          <Route path="/banks" element={<ProtectedRoute module="banks"><Banks /></ProtectedRoute>} />
          <Route path="/activities" element={<ProtectedRoute module="activities"><Activities /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute module="setup"><Setup /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute module="audit_log"><AuditLog /></ProtectedRoute>} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </DataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}