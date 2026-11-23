import { useAuth } from '../context/AuthContext';

export function usePermission(module, action = 'view') {
  const { profile } = useAuth();
  if (!profile) return false;
  if (profile.role === 'super_admin') return true;
  const perms = profile.permissions?.[module];
  return Boolean(perms && perms[action]);
}