import { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Users, Calendar, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePermission } from '../hooks/usePermission';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const empty = {
  name: '',
  category: '',
  activity_date: new Date().toISOString().slice(0, 10),
  responsible_person: '',
  beneficiaries_count: 0,
  status: 'planned',
  description: '',
  notes: '',
  documentation_url: '',
};

export default function Activities() {
  const {
    activities, categories, addActivity, updateActivity, deleteActivity, addCategory, monthOf,
  } = useData();
  const canCreate = usePermission('activities', 'create');
  const canEdit = usePermission('activities', 'edit');
  const canDelete = usePermission('activities', 'delete');

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const activityCategories = categories.filter((c) => c.type === 'activity');
  const categoryNames = activityCategories.length
    ? activityCategories.map((c) => c.name)
    : ['رياضي', 'ثقافي', 'اجتماعي', 'فني', 'تنمية موارد'];

  const filtered = activities.filter((a) => {
    if (filter && a.category !== filter) return false;
    if (monthFilter && monthOf(a) !== monthFilter) return false;
    return true;
  });

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setShowNewCategory(false);
    setNewCategory('');
    setModal(true);
  }

  function openEdit(a) {
    setEditing(a);
    setForm({ ...empty, ...a });
    setShowNewCategory(false);
    setNewCategory('');
    setModal(true);
  }

  async function handleAddCategory() {
    const name = newCategory.trim();
    if (!name) return;
    await addCategory({ name, type: 'activity', description: '' });
    setForm((f) => ({ ...f, category: name }));
    setNewCategory('');
    setShowNewCategory(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category) {
      alert('اختر فئة النشاط أو أضف فئة جديدة');
      return;
    }
    const payload = { ...form, beneficiaries_count: Number(form.beneficiaries_count) };
    if (editing) await updateActivity(editing.id, payload);
    else await addActivity(payload);
    setModal(false);
  }

  const statusLabel = { planned: 'مخطط', ongoing: 'جارٍ التنفيذ', completed: 'مكتمل' };
  const statusColor = {
    planned: 'bg-slate-100 text-slate-700',
    ongoing: 'bg-amber-100 text-amber-700',
    completed: 'bg-brand-100 text-brand-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800">سجل الأنشطة</h1>
          <p className="text-sm text-slate-500">متابعة أنشطة مجلس الإدارة</p>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <Input label="الشهر" type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
          <Select label="الفئة" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">كل الفئات</option>
            {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          {canCreate && (
            <Button onClick={openAdd}>
              <Plus size={18} className="inline ml-1" /> إضافة نشاط
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="card p-5 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs font-bold px-2 py-1 bg-brand-50 text-brand-700 rounded-lg">{a.category}</span>
                <h3 className="font-bold text-navy-800 mt-2">{a.name}</h3>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusColor[a.status]}`}>
                {statusLabel[a.status]}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-3 flex-1 line-clamp-2">
              {a.description || 'لا يوجد وصف'}
            </p>

            <div className="space-y-1 text-xs text-slate-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar size={12} /> {monthOf(a)} • {a.activity_date}
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} /> {a.beneficiaries_count} مستفيد • {a.responsible_person || '-'}
              </div>
              {a.notes && (
                <div className="flex items-start gap-1 bg-amber-50 border border-amber-100 rounded-lg p-2 mt-1">
                  <FileText size={12} className="text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-amber-800">{a.notes}</span>
                </div>
              )}
            </div>

            <div className="flex gap-1 justify-end">
              {a.documentation_url && (
                <a href={a.documentation_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                  <ExternalLink size={15} />
                </a>
              )}
              {canEdit && (
                <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-600">
                  <Edit2 size={15} />
                </button>
              )}
              {canDelete && (
                <button onClick={() => { if (confirm('حذف النشاط؟')) deleteActivity(a.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-10">لا توجد أنشطة</p>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'تعديل النشاط' : 'إضافة نشاط'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="اسم النشاط" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label className="label">الفئة</label>
              <div className="flex gap-2">
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">اختر الفئة</option>
                  {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory((v) => !v)}
                  className="px-3 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100"
                  title="إضافة فئة جديدة"
                >
                  <Plus size={18} />
                </button>
              </div>
              {showNewCategory && (
                <div className="mt-2 flex gap-2">
                  <input
                    className="input-field"
                    placeholder="اسم الفئة الجديدة"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button type="button" onClick={handleAddCategory} className="btn-primary px-3">إضافة</button>
                </div>
              )}
            </div>

            <Input label="تاريخ التنفيذ" type="date" required value={form.activity_date} onChange={(e) => setForm({ ...form, activity_date: e.target.value })} />
            <Input label="المسؤول" value={form.responsible_person} onChange={(e) => setForm({ ...form, responsible_person: e.target.value })} />
            <Input label="عدد المستفيدين" type="number" value={form.beneficiaries_count} onChange={(e) => setForm({ ...form, beneficiaries_count: e.target.value })} />

            <Select label="الحالة" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="planned">مخطط</option>
              <option value="ongoing">جارٍ التنفيذ</option>
              <option value="completed">مكتمل</option>
            </Select>

            <Input label="رابط التوثيق" value={form.documentation_url} onChange={(e) => setForm({ ...form, documentation_url: e.target.value })} />

            <div className="md:col-span-2">
              <label className="label">الوصف</label>
              <textarea rows={3} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="label">ملاحظات</label>
              <textarea rows={2} className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="أي ملاحظات إضافية..." />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>إلغاء</Button>
            <Button type="submit">{editing ? 'حفظ' : 'إضافة'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}