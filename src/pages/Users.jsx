import { useState } from 'react';
import { Save, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const MODULES = [
  { key: 'dashboard', label: 'لوحة القيادة' },
  { key: 'finance', label: 'الإدارة المالية' },
  { key: 'banks', label: 'الحسابات البنكية' },
  { key: 'activities', label: 'سجل الأنشطة' },
  { key: 'setup', label: 'الإعدادات' },
  { key: 'reports', label: 'التقارير' },
  { key: 'audit_log', label: 'سجل المراقبة' },
];
const ACTIONS = [
  { key: 'view', label: 'عرض' },
  { key: 'create', label: 'إضافة' },
  { key: 'edit', label: 'تعديل' },
  { key: 'delete', label: 'حذف' },
];

export default function Users() {
  const { users, updateUserPermissions } = useData();
  const { profile } = useAuth();
  const [selectedId, setSelectedId] = useState(users[0]?.id);
  const [perms, setPerms] = useState(null);

  const selected = users.find((u) => u.id === selectedId);
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (selected && (!perms || perms.__user !== selectedId)) {
    setPerms({ ...selected.permissions, __user: selectedId });
  }

  function toggle(module, action) {
    setPerms((p) => ({
      ...p,
      [module]: { ...p[module], [action]: !p[module]?.[action] },
    }));
  }

  async function save() {
    const { __user, ...clean } = perms;
    await updateUserPermissions(selectedId, clean);
    alert('تم حفظ الصلاحيات بنجاح');
  }

  if (profile?.role !== 'super_admin') {
    return <div className="card p-8 text-center text-red-600">ليس لديك صلاحية الوصول لهذه الصفحة</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800">المستخدمون والصلاحيات</h1>
          <p className="text-sm text-slate-500">إدارة صلاحيات كل عضو في مجلس الإدارة</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700">
          الشهر الحالي: {currentMonth}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* قائمة الأعضاء */}
        <div className="card p-3 lg:col-span-1 h-fit">
          <p className="text-xs font-bold text-slate-500 px-2 mb-2">الأعضاء ({users.length})</p>
          <div className="space-y-1">
            {users.map((u) => (
              <button key={u.id} onClick={() => { setSelectedId(u.id); setPerms(null); }}
                className={`w-full text-right p-3 rounded-xl transition ${selectedId === u.id ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-navy-700 text-white flex items-center justify-center text-xs font-bold">
                    {u.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-navy-800 truncate">{u.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {u.role === 'super_admin' ? 'مدير النظام' : u.role === 'admin' ? 'أدمن' : 'عضو'}
                    </p>
                    {u.created_at && (
                      <p className="text-[10px] text-slate-400">انضم: {u.created_at.slice(0, 7)}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* مصفوفة الصلاحيات */}
        <div className="card p-5 lg:col-span-3">
          {selected ? (
            <>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center">
                  <Shield size={22} className="text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-navy-800">{selected.full_name}</p>
                  <p className="text-xs text-slate-500">{selected.email}</p>
                </div>
                {selected.created_at && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                    انضم: {selected.created_at.slice(0, 7)}
                  </span>
                )}
              </div>

              {selected.role === 'super_admin' ? (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-semibold text-center">
                  ⚠️ هذا المستخدم مدير نظام (Super Admin) ويملك كافة الصلاحيات تلقائياً
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="p-3 text-right font-bold text-slate-600 rounded-r-xl">القسم</th>
                          {ACTIONS.map((a) => <th key={a.key} className="p-3 text-center font-bold text-slate-600">{a.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES.map((m) => (
                          <tr key={m.key} className="border-b border-slate-50">
                            <td className="p-3 font-semibold text-navy-800">{m.label}</td>
                            {ACTIONS.map((a) => (
                              <td key={a.key} className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 accent-brand-600 cursor-pointer"
                                  checked={Boolean(perms?.[m.key]?.[a.key])}
                                  onChange={() => toggle(m.key, a.key)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-5">
                    <Button onClick={save}><Save size={16} className="inline ml-1" /> حفظ الصلاحيات</Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-center text-slate-400 py-10">اختر مستخدماً لعرض صلاحياته</p>
          )}
        </div>
      </div>
    </div>
  );
}