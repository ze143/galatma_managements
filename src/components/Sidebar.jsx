import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Landmark, CalendarDays, Settings,
  FileBarChart, ShieldCheck, Users, LogOut, Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../hooks/usePermission';

function NavItem({ item, onClick }) {
  const allowed = item.superOnly
    ? useAuth().profile?.role === 'super_admin'
    : usePermission(item.module);
  if (!allowed) return null;
  return (
    <NavLink to={item.to} onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}>
      <item.icon size={18} /> {item.label}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth();
  const items = [
    { to: '/dashboard', label: 'لوحة القيادة', icon: LayoutDashboard, module: 'dashboard' },
    { to: '/finance', label: 'الإدارة المالية', icon: Wallet, module: 'finance' },
    { to: '/banks', label: 'الحسابات البنكية', icon: Landmark, module: 'banks' },
    { to: '/activities', label: 'سجل الأنشطة', icon: CalendarDays, module: 'activities' },
    { to: '/reports', label: 'التقارير', icon: FileBarChart, module: 'reports' },
    { to: '/setup', label: 'الإعدادات', icon: Settings, module: 'setup' },
    { to: '/audit', label: 'سجل المراقبة', icon: ShieldCheck, module: 'audit_log' },
    { to: '/users', label: 'المستخدمون والصلاحيات', icon: Users, superOnly: true },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-navy-800 text-white z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="bg-brand-500 p-2.5 rounded-xl"><Trophy size={22} /></div>
          <div>
            <h1 className="font-bold text-lg leading-tight">مركز شباب الجلاتمة</h1>
            <p className="text-xs text-brand-300">نظام الإدارة المالية</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((it) => <NavItem key={it.to} item={it} onClick={onClose} />)}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="mb-3">
            <p className="text-sm font-bold truncate">{profile?.full_name}</p>
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10 transition">
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}