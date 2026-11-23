import { useState } from 'react';
import { Plus, Edit2, Trash2, Landmark } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePermission } from '../hooks/usePermission';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const empty = { bank_name: '', account_number: '', account_holder: '', opening_balance: 0, notes: '' };

export default function Banks() {
  const { banks, transactions, getBankTotals, addBank, updateBank, deleteBank, monthOf } = useData();
  const canCreate = usePermission('banks', 'create');
  const canEdit = usePermission('banks', 'edit');
  const canDelete = usePermission('banks', 'delete');

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const totals = getBankTotals();
  const currentMonth = new Date().toISOString().slice(0, 7);

  function monthNet(bankId) {
    return transactions
      .filter((t) => monthOf(t) === currentMonth && (t.bank_account_id === bankId || t.to_bank_account_id === bankId))
      .reduce((s, t) => {
        if (t.type === 'income' && t.bank_account_id === bankId) return s + Number(t.amount);
        if (t.type === 'expense' && t.bank_account_id === bankId) return s - Number(t.amount);
        if (t.type === 'transfer' && t.bank_account_id === bankId) return s - Number(t.amount);
        if (t.type === 'transfer' && t.to_bank_account_id === bankId) return s + Number(t.amount);
        return s;
      }, 0);
  }

  function openAdd() { setEditing(null); setForm(empty); setModal(true); }
  function openEdit(b) { setEditing(b); setForm({ ...empty, ...b }); setModal(true); }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, opening_balance: Number(form.opening_balance) };
    if (editing) await updateBank(editing.id, payload);
    else await addBank(payload);
    setModal(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800">الحسابات البنكية</h1>
          <p className="text-sm text-slate-500">إدارة حسابات المركز وأرصدتها</p>
        </div>
        {canCreate && <Button onClick={openAdd}><Plus size={18} className="inline ml-1" /> إضافة حساب</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {totals.map((b) => (
          <div key={b.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-brand-50 p-2.5 rounded-xl"><Landmark size={22} className="text-brand-600" /></div>
              <div className="flex gap-1">
                {canEdit && <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-600"><Edit2 size={16} /></button>}
                {canDelete && <button onClick={() => { if (confirm('حذف الحساب؟')) deleteBank(b.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 size={16} /></button>}
              </div>
            </div>
            <h3 className="font-bold text-navy-800">{b.bank_name}</h3>
            <p className="text-xs text-slate-500 font-mono">{b.account_number}</p>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">الرصيد الافتتاحي:</span><span className="font-semibold">{Number(b.opening_balance).toLocaleString('ar-EG')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">إيرادات:</span><span className="font-semibold text-brand-600">+{Number(b.total_income).toLocaleString('ar-EG')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">مصروفات:</span><span className="font-semibold text-red-600">-{Number(b.total_expense).toLocaleString('ar-EG')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">صافي حركة {currentMonth}:</span><span className={`font-semibold ${monthNet(b.id) >= 0 ? 'text-brand-600' : 'text-red-600'}`}>{monthNet(b.id).toLocaleString('ar-EG')}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">الرصيد الحالي</span>
              <span className="text-lg font-extrabold text-brand-700">{Number(b.current_balance).toLocaleString('ar-EG')} ج.م</span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'تعديل الحساب' : 'إضافة حساب بنكي'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="اسم البنك" required value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
          <Input label="رقم الحساب" required value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
          <Input label="اسم صاحب الحساب" value={form.account_holder} onChange={(e) => setForm({ ...form, account_holder: e.target.value })} />
          <Input label="الرصيد الافتتاحي (ج.م)" type="number" step="0.01" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} />
          <Input label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>إلغاء</Button>
            <Button type="submit">{editing ? 'حفظ' : 'إضافة'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}