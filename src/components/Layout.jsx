import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  return (
    <div className="min-h-screen flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 px-4 lg:px-8 py-3 flex items-center gap-3">
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-xl" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-navy-800">مرحباً، {profile?.full_name?.split(' ')[0] || 'عضو'}</h2>
            <p className="text-xs text-slate-500">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}