import { Navigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

export default function ProtectedRoute({ module, action = 'view', children }) {
  const allowed = usePermission(module, action);
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return children;
}