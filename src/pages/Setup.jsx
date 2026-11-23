import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Settings as SettingsIcon, Calendar, Info } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePermission } from '../hooks/usePermission';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

export default function Setup() {
  const { categories, transactions, addCategory, deleteCategory } = useData();
  const canCreate = usePermission('setup', 'create');
  const canDelete = usePermission('setup', 'delete');
  const canEdit = usePermission('setup', 'edit');

  const [form, setForm] = useState({ name: '', type: 'income', description: '' });
  const [cycleDate, setCycleDate] = useState('');
  const [savedCycle, setSavedCycle] = useState('');
  const [saving, setSaving] = useState(false);

  // تحميل تاريخ الدورة المحفوظ
  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        const local = localStorage.getItem('cycle_start_date');
        if (local) { setCycleDate(local); setSavedCycle(local); }
        return;
      }
      const { data } = await supabase.from('system_settings').select('cycle_start_date').eq('id', 1).maybeSingle();
      if (data?.cycle_start_date) {
        setCycleDate(data.cycle_start_date);
        setSavedCycle(data.cycle_start_date);
      }
    }
    load();
  }, []);

  async function saveCycle() {
    if (!cycleDate) return;
    setSaving(true);
    if (!isSupabaseConfigured) {
      localStorage.setItem('cycle_start_date', cycleDate);
    } else {
      await supabase.from('system_settings').update({ cycle_start_date: cycleDate, updated_at: new Date().toISOString() }).eq('id', 1);
    }
    setSavedCycle(cycleDate);
    setSaving(false);
    alert('تم حفظ تاريخ بداية الدورة');
  }

  // حساب الأشهر من بداية الدورة حتى الآن
  const monthsFromCycle = useMemo(() => {
    if (!savedCycle) return [];
    const start = new Date(savedCycle);
    const end = new Date();
    const list = [];
    let i = 0;
    while (true) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      if (d > end) break;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push({ index: i + 1, key, label: `شهر ${i + 1} (${key})` });
      i += 1;
      if (i > 240) break; // حماية
    }
    return list;
  }, [savedCycle]);

  // عدد الحركات المرتبطة بكل فئة (لمنع الحذف الخاطئ)
  const categoryUsage = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (t.category_id) map[t.category_id] = (map[t.category_id] || 0) + 1;
    });
    return map;
  }, [transactions]);

  async function add(e) {
    e.preventDefault();
    if (!form.name) return;
    await addCategory(form);
    setForm({ name: '', type: 'income', description: '' });
  }

  async function removeCategory(c) {
    if (categoryUsage[c.id]) {
      alert(`لا يمكن حذف "${c.name}" لوجود ${categoryUsage[c.id]} حركة مرتبطة به`);
      return;
    }
    if (!confirm(`حذف البند "${c.name}"؟`)) return;
    await deleteCategory(c.id);
  }

  const groups = [
    { key: 'income', label: 'بنود الإيرادات', color: 'text-brand-700 bg-brand-50' },
    { key: 'expense', label: 'بنود المصروفات', color: 'text-red-700 bg-red-50' },
    { key: 'activity', label: 'فئات الأنشطة', color: 'text-amber-700 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-800">الإعدادات والأرصدة الافتتاحية</h1>
        <p className="text-sm text-slate-500">ضبط دورة المجلس وإدارة البنود والفئات</p>
      </div>

      {/* دورة المجلس */}
      <div className="card p-5">
        <h2 className="font-bold text-navy-800 mb-3 flex items-center gap-2"><SettingsIcon size={18} /> دورة المجلس</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="تاريخ بداية الدورة الانتخابية"
            type="date"
            value={cycleDate}
            onChange={(e) => setCycleDate(e.target.value)}
            disabled={!canEdit}
          />
          <div className="flex items-end">
            <Button onClick={saveCycle} disabled={!canEdit || !cycleDate || saving || cycleDate === savedCycle}>
              {saving ? 'جارٍ الحفظ...' : 'حفظ تاريخ الدورة'}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            يُستخدم هذا التاريخ لترقيم الأشهر من بداية الدورة (شهر 1، شهر 2، ...).
            {savedCycle && <> التاريخ المحفوظ حالياً: <strong>{savedCycle}</strong></>}
          </span>
        </div>
      </div>

      {/* قائمة أشهر الدورة */}
      {monthsFromCycle.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-navy-800 mb-3 flex items-center gap-2"><Calendar size={18} /> الأشهر من بداية الدورة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {monthsFromCycle.map((m) => (
              <div key={m.key} className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-brand-700">{m.label.split(' ')[0]} {m.label.split(' ')[1]}</p>
                <p className="text-[10px] text-slate-400 font-mono">{m.key}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* إضافة بند */}
      {canCreate && (
        <div className="card p-5">
          <h2 className="font-bold text-navy-800 mb-3">إضافة بند / فئة جديدة</h2>
          <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input label="الاسم" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="النوع" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="income">إيراد</option>
              <option value="expense">مصروف</option>
              <option value="activity">فئة نشاط</option>
            </Select>
            <Input label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex items-end"><Button type="submit" className="w-full"><Plus size={16} className="inline ml-1" /> إضافة</Button></div>
          </form>
        </div>
      )}

      {/* مجموعات الفئات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div key={g.key} className="card p-5">
            <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 ${g.color}`}>{g.label}</div>
            <ul className="space-y-2">
              {categories.filter((c) => c.type === g.key).map((c) => (
                <li key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">{c.name}</span>
                    {categoryUsage[c.id] ? (
                      <span className="text-[10px] text-slate-400 mr-2">({categoryUsage[c.id]} حركة)</span>
                    ) : null}
                  </div>
                  {canDelete && (
                    <button onClick={() => removeCategory(c)} className="p-1 hover:bg-red-50 rounded text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
              {categories.filter((c) => c.type === g.key).length === 0 && (
                <li className="text-xs text-slate-400 text-center py-3">لا توجد بنود</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}