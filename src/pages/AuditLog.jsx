import { useState } from 'react';
import { useData } from '../context/DataContext';
import { ShieldCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import Input from '../components/ui/Input';

export default function AuditLog() {
  const { auditLogs } = useData();
  const [monthFilter, setMonthFilter] = useState('');

  const actionMap = {
    INSERT: { label: 'إضافة', icon: Plus, color: 'bg-brand-100 text-brand-700' },
    UPDATE: { label: 'تعديل', icon: Pencil, color: 'bg-amber-100 text-amber-700' },
    DELETE: { label: 'حذف', icon: Trash2, color: 'bg-red-100 text-red-700' },
  };
  const tableMap = { transactions: 'المعاملات', bank_accounts: 'البنوك', activities: 'الأنشطة' };

  const filteredLogs = auditLogs.filter((l) => !monthFilter || (l.created_at || '').slice(0, 7) === monthFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-800 flex items-center gap-2"><ShieldCheck size={24} /> سجل المراقبة والشفافية</h1>
        <p className="text-sm text-slate-500">تسجيل تلقائي لكل عمليات الإضافة والتعديل والحذف</p>
      </div>

      <div className="card p-4 max-w-xs">
        <Input label="فلتر بالشهر" type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-right font-bold text-slate-600">الشهر</th>
                <th className="p-3 text-right font-bold text-slate-600">المستخدم</th>
                <th className="p-3 text-right font-bold text-slate-600">العملية</th>
                <th className="p-3 text-right font-bold text-slate-600">الجدول</th>
                <th className="p-3 text-right font-bold text-slate-600">معرف السجل</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l) => {
                const a = actionMap[l.action] || {};
                const Icon = a.icon || Plus;
                return (
                  <tr key={l.id} className="border-b border-slate-50">
                    <td className="p-3 font-semibold">{(l.created_at || '').slice(0, 7)}</td>
                    <td className="p-3">{l.user_email || '-'}</td>
                    <td className="p-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${a.color}`}><Icon size={12} /> {a.label}</span></td>
                    <td className="p-3">{tableMap[l.table_name] || l.table_name}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{l.record_id?.slice(0, 8)}</td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد سجلات بعد</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}