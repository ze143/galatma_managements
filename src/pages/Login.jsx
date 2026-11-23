import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Trophy, Mail, Lock, ArrowLeft } from 'lucide-react';
import { mockUsers } from '../data/mockData';

export default function Login() {
  const { signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-700 to-brand-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-500 rounded-3xl mb-4 shadow-xl">
            <Trophy size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">مركز شباب الجلاتمة</h1>
          <p className="text-brand-200 mt-2">نظام الإدارة المالية والمتابعة</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8">
          {!isSupabaseConfigured && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
              ⚡ وضع البيانات التجريبية مفعّل - اختر أحد الحسابات أدناه للدخول الفوري
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-3 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pr-10" placeholder="example@jallatma.com" />
              </div>
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-3 top-3 text-slate-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••" />
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</div>}
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'} <ArrowLeft size={18} />
            </button>
          </form>

          {!isSupabaseConfigured && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-semibold">دخول سريع للتجربة</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-2">
                {mockUsers.map((u) => (
                  <button key={u.id} onClick={() => signInDemo(u.id)}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition">
                    <p className="font-bold text-sm text-navy-800">{u.full_name}</p>
                    <p className="text-xs text-slate-500">{u.email} • {u.role === 'super_admin' ? 'مدير النظام' : u.role === 'admin' ? 'أدمن' : 'عضو'}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-brand-200 mt-6">© {new Date().getFullYear()} جميع الحقوق محفوظة - مركز شباب الجلاتمة</p>
      </div>
    </div>
  );
}