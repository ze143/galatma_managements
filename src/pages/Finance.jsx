import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePermission } from '../hooks/usePermission';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const currentMonth = new Date().toISOString().slice(0, 7);

const empty = {
  transaction_date: currentMonth, // YYYY-MM
  type: 'income', category_id: '', bank_account_id: '', to_bank_account_id: '',
  amount: '', receipt_number: '', notes: '', activity_id: '',
};

export default function Finance() {
  const { transactions, categories, banks, activities, addTransaction, updateTransaction, deleteTransaction, monthOf } = useData();
  const canCreate = usePermission('finance', 'create');
  const canEdit = usePermission('finance', 'edit');
  const canDelete = usePermission('finance', 'delete');

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filters, setFilters] = useState({ fromMonth: '', toMonth: '', type: '', category: '', bank: '', search: '' });

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const m = monthOf(t);
      if (filters.fromMonth && m < filters.fromMonth) return false;
      if (filters.toMonth && m > filters.toMonth) return false;
      if (filters.type && t.type !== filters.type) return false;
      if (filters.category && t.category_id !== filters.category) return false;
      if (filters.bank && t.bank_account_id !== filters.bank) return false;
      if (filters.search && !(t.notes || '').includes(filters.search) && !(t.receipt_number || '').includes(filters.search)) return false;
      return true;
    });
  }, [transactions, filters, monthOf]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  function openAdd() { setEditing(null); setForm(empty); setModal(true); }
  function openEdit(t) {
    setEditing(t);
    setForm({ ...empty, ...t, transaction_date: monthOf(t) });
    setModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      transaction_date: `${form.transaction_date}-01`, // نخزن أول يوم في الشهر
      amount: Number(form.amount),
      category_id: form.category_id || null,
      to_bank_account_id: form.type === 'transfer' ? form.to_bank_account_id : null,
      activity_id: form.activity_id || null,
    };
    if (editing) await updateTransaction(editing.id, payload);
    else await addTransaction(payload);
    setModal(false);
  }

  const typeLabel = (t) => t === 'income' ? 'إيراد' : t === 'expense' ? 'مصروف' : 'تحويل';
  const typeColor = (t) => t === 'income' ? 'bg-brand-100 text-brand-700' : t === 'expense' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
  const catName = (id) => categories.find((c) => c.id === id)?.name || '-';
  const bankName = (id) => banks.find((b) => b.id === id)?.bank_name || '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800">الإدارة المالية</h1>
          <p className="text-sm text-slate-500">تسجيل ومتابعة كافة الحركات المالية</p>
        </div>
        {canCreate && <Button onClick={openAdd}><Plus size={18} className="inline ml-1" /> إضافة حركة</Button>}
      </div>

      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Input label="من شهر" type="month" value={filters.fromMonth} onChange={(e) => setFilters({ ...filters, fromMonth: e.target.value })} />
        <Input label="إلى شهر" type="month" value={filters.toMonth} onChange={(e) => setFilters({ ...filters, toMonth: e.target.value })} />
        <Select label="النوع" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">الكل</option><option value="income">إيراد</option><option value="expense">مصروف</option><option value="transfer">تحويل</option>
        </Select>
        <Select label="البند" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">الكل</option>
          {categories.filter((c) => c.type !== 'activity').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="البنك" value={filters.bank} onChange={(e) => setFilters({ ...filters, bank: e.target.value })}>
          <option value="">الكل</option>
          {banks.map((b) => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
        </Select>
        <div>
          <label className="label text-xs"><Search size={12} className="inline ml-1" /> بحث</label>
          <input className="input-field" placeholder="إيصال أو ملاحظة..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4 border-r-4 border-brand-500">
          <p className="text-xs text-slate-500 font-semibold">إجمالي الإيرادات (المفلترة)</p>
          <p className="text-xl font-extrabold text-brand-700">{totals.income.toLocaleString('ar-EG')} ج.م</p>
        </div>
        <div className="card p-4 border-r-4 border-red-500">
          <p className="text-xs text-slate-500 font-semibold">إجمالي المصروفات (المفلترة)</p>
          <p className="text-xl font-extrabold text-red-700">{totals.expense.toLocaleString('ar-EG')} ج.م</p>
        </div>
        <div className="card p-4 border-r-4 border-amber-500">
          <p className="text-xs text-slate-500 font-semibold">الصافي</p>
          <p className={`text-xl font-extrabold ${totals.net >= 0 ? 'text-brand-700' : 'text-red-700'}`}>{totals.net.toLocaleString('ar-EG')} ج.م</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-3 text-right font-bold text-slate-600">الشهر</th>
                <th className="p-3 text-right font-bold text-slate-600">النوع</th>
                <th className="p-3 text-right font-bold text-slate-600">البند</th>
                <th className="p-3 text-right font-bold text-slate-600">البنك</th>
                <th className="p-3 text-right font-bold text-slate-600">المبلغ</th>
                <th className="p-3 text-right font-bold text-slate-600">الإيصال</th>
                <th className="p-3 text-right font-bold text-slate-600">ملاحظات</th>
                {(canEdit || canDelete) && <th className="p-3 text-right font-bold text-slate-600">إجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-3 font-semibold">{monthOf(t)}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${typeColor(t.type)}`}>{typeLabel(t.type)}</span></td>
                  <td className="p-3">{catName(t.category_id)}</td>
                  <td className="p-3">{bankName(t.bank_account_id)}{t.type === 'transfer' && <span className="text-xs text-slate-400"> ← {bankName(t.to_bank_account_id)}</span>}</td>
                  <td className="p-3 font-bold">{Number(t.amount).toLocaleString('ar-EG')} ج.م</td>
                  <td className="p-3 text-slate-500 font-mono text-xs">{t.receipt_number || '-'}</td>
                  <td className="p-3 text-slate-500 text-xs max-w-[160px] truncate">{t.notes || '-'}</td>
                  {(canEdit || canDelete) && (
                    <td className="p-3">
                      <div className="flex gap-1">
                        {canEdit && <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-600"><Edit2 size={15} /></button>}
                        {canDelete && <button onClick={() => { if (confirm('هل أنت متأكد من الحذف؟')) deleteTransaction(t.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 size={15} /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">لا توجد حركات مطابقة</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'تعديل الحركة' : 'إضافة حركة جديدة'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="الشهر" type="month" required value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
            <Select label="النوع" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="income">إيراد</option><option value="expense">مصروف</option><option value="transfer">تحويل بين البنوك</option>
            </Select>
            {form.type !== 'transfer' && (
              <Select label="البند" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">اختر البند</option>
                {categories.filter((c) => c.type === form.type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            )}
            <Select label="الحساب البنكي" required value={form.bank_account_id} onChange={(e) => setForm({ ...form, bank_account_id: e.target.value })}>
              <option value="">اختر البنك</option>
              {banks.map((b) => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
            </Select>
            {form.type === 'transfer' && (
              <Select label="الحساب المحوّل إليه" required value={form.to_bank_account_id} onChange={(e) => setForm({ ...form, to_bank_account_id: e.target.value })}>
                <option value="">اختر البنك</option>
                {banks.filter((b) => b.id !== form.bank_account_id).map((b) => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
              </Select>
            )}
            <Input label="المبلغ (ج.م)" type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input label="رقم الإيصال/المستند" value={form.receipt_number} onChange={(e) => setForm({ ...form, receipt_number: e.target.value })} />
            {form.type !== 'transfer' && (
              <Select label="ربط بنشاط (اختياري)" value={form.activity_id} onChange={(e) => setForm({ ...form, activity_id: e.target.value })}>
                <option value="">بدون</option>
                {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            )}
            <div className="md:col-span-2">
              <Input label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>إلغاء</Button>
            <Button type="submit">{editing ? 'حفظ التعديلات' : 'إضافة'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}