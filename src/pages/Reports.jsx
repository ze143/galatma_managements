import { useMemo, useState } from 'react';
import { Download, Printer, Filter, TrendingUp, TrendingDown, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const TABS = [
  { key: 'summary', label: 'ملخص عام', icon: BarChart3 },
  { key: 'byCategory', label: 'حسب البند', icon: TrendingDown },
  { key: 'byMonth', label: 'حسب الشهر', icon: Calendar },
  { key: 'shortPeriod', label: 'صرف في فترة قصيرة', icon: AlertTriangle },
  { key: 'byBank', label: 'حسب البنك', icon: TrendingUp },
  { key: 'topExpenses', label: 'أكبر المصروفات', icon: TrendingDown },
  { key: 'cashflow', label: 'التدفق النقدي', icon: Calendar },
];

export default function Reports() {
  const { transactions, categories, banks } = useData();

  const [tab, setTab] = useState('summary');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [shortMonths, setShortMonths] = useState(2); // آخر عدد أشهر

  const catName = (id) => categories.find((c) => c.id === id)?.name || 'غير مصنف';
  const bankName = (id) => banks.find((b) => b.id === id)?.bank_name || '-';
  const monthOf = (t) => (t.transaction_date || '').slice(0, 7); // YYYY-MM

  // فلترة أساسية بالشهر
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const m = monthOf(t);
      if (fromMonth && m < fromMonth) return false;
      if (toMonth && m > toMonth) return false;
      if (typeFilter && t.type !== typeFilter) return false;
      if (bankFilter && t.bank_account_id !== bankFilter) return false;
      if (categoryFilter && t.category_id !== categoryFilter) return false;
      return true;
    });
  }, [transactions, fromMonth, toMonth, typeFilter, bankFilter, categoryFilter]);

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  // حسب البند
  const byCategory = useMemo(() => {
    const map = {};
    filtered.filter((t) => t.type !== 'transfer').forEach((t) => {
      const key = `${t.type}|${t.category_id || 'none'}`;
      if (!map[key]) map[key] = { type: t.type, name: catName(t.category_id), total: 0, count: 0 };
      map[key].total += Number(t.amount);
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered, categories]);

  // حسب الشهر
  const byMonth = useMemo(() => {
    const map = {};
    filtered.filter((t) => t.type !== 'transfer').forEach((t) => {
      const m = monthOf(t);
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 };
      map[m][t.type] += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  // حسب البنك
  const byBank = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      if (t.type === 'income') {
        if (!map[t.bank_account_id]) map[t.bank_account_id] = { bank: bankName(t.bank_account_id), income: 0, expense: 0, transfersIn: 0, transfersOut: 0 };
        map[t.bank_account_id].income += Number(t.amount);
      } else if (t.type === 'expense') {
        if (!map[t.bank_account_id]) map[t.bank_account_id] = { bank: bankName(t.bank_account_id), income: 0, expense: 0, transfersIn: 0, transfersOut: 0 };
        map[t.bank_account_id].expense += Number(t.amount);
      } else if (t.type === 'transfer') {
        if (!map[t.bank_account_id]) map[t.bank_account_id] = { bank: bankName(t.bank_account_id), income: 0, expense: 0, transfersIn: 0, transfersOut: 0 };
        map[t.bank_account_id].transfersOut += Number(t.amount);
        if (!map[t.to_bank_account_id]) map[t.to_bank_account_id] = { bank: bankName(t.to_bank_account_id), income: 0, expense: 0, transfersIn: 0, transfersOut: 0 };
        map[t.to_bank_account_id].transfersIn += Number(t.amount);
      }
    });
    return Object.values(map);
  }, [filtered, banks]);

  // البنود التي صُرف عليها في آخر N أشهر
  const shortPeriod = useMemo(() => {
    if (filtered.length === 0) return [];
    const months = Array.from(new Set(filtered.map(monthOf))).sort();
    const lastMonth = months[months.length - 1];
    const [y, m] = lastMonth.split('-').map(Number);
    const cutoffDate = new Date(y, m - 1 - (Number(shortMonths) - 1), 1);
    const cutoff = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}`;

    const map = {};
    filtered
      .filter((t) => t.type === 'expense' && monthOf(t) >= cutoff)
      .forEach((t) => {
        const name = catName(t.category_id);
        if (!map[name]) map[name] = { name, total: 0, count: 0, months: new Set() };
        map[name].total += Number(t.amount);
        map[name].count += 1;
        map[name].months.add(monthOf(t));
      });
    return Object.values(map)
      .map((r) => ({ ...r, monthsCount: r.months.size, avg: r.total / r.count }))
      .sort((a, b) => b.total - a.total);
  }, [filtered, categories, shortMonths]);

  // أكبر 10 مصروفات
  const topExpenses = useMemo(() => {
    return filtered
      .filter((t) => t.type === 'expense')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 10);
  }, [filtered]);

  // التدفق النقدي شهرياً
  const cashflow = useMemo(() => byMonth.map((m) => ({ ...m, net: m.income - m.expense })), [byMonth]);

  function exportCSV(headers, rows, name) {
    const all = [headers, ...rows];
    const csv = '\uFEFF' + all.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function currentExport() {
    if (tab === 'byCategory') exportCSV(
      ['النوع', 'البند', 'الإجمالي', 'عدد الحركات'],
      byCategory.map((r) => [r.type === 'income' ? 'إيراد' : 'مصروف', r.name, r.total, r.count]),
      'تقرير-حسب-البند'
    );
    else if (tab === 'byMonth') exportCSV(
      ['الشهر', 'إيرادات', 'مصروفات', 'صافي'],
      byMonth.map((r) => [r.month, r.income, r.expense, r.income - r.expense]),
      'تقرير-حسب-الشهر'
    );
    else if (tab === 'byBank') exportCSV(
      ['البنك', 'إيرادات', 'مصروفات', 'تحويلات واردة', 'تحويلات صادرة'],
      byBank.map((r) => [r.bank, r.income, r.expense, r.transfersIn, r.transfersOut]),
      'تقرير-حسب-البنك'
    );
    else if (tab === 'shortPeriod') exportCSV(
      ['البند', 'الإجمالي', 'عدد الحركات', 'عدد الأشهر', 'المتوسط'],
      shortPeriod.map((r) => [r.name, r.total, r.count, r.monthsCount, r.avg.toFixed(2)]),
      `تقرير-صرف-آخر-${shortMonths}-أشهر`
    );
    else if (tab === 'topExpenses') exportCSV(
      ['التاريخ', 'الشهر', 'البند', 'البنك', 'المبلغ', 'الإيصال'],
      topExpenses.map((t) => [t.transaction_date, monthOf(t), catName(t.category_id), bankName(t.bank_account_id), t.amount, t.receipt_number || '']),
      'تقرير-أكبر-المصروفات'
    );
    else exportCSV(
      ['الشهر', 'التاريخ', 'النوع', 'البند', 'البنك', 'المبلغ', 'الإيصال', 'ملاحظات'],
      filtered.map((t) => [monthOf(t), t.transaction_date, t.type, catName(t.category_id), bankName(t.bank_account_id), t.amount, t.receipt_number || '', t.notes || '']),
      'تقرير-ملخص'
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800">التقارير التحليلية</h1>
          <p className="text-sm text-slate-500">تحليل شهري دقيق للحركة المالية</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={currentExport}><Download size={16} className="inline ml-1" /> تصدير CSV</Button>
          <Button variant="secondary" onClick={() => window.print()}><Printer size={16} className="inline ml-1" /> طباعة</Button>
        </div>
      </div>

      {/* فلاتر بالشهر */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Input label="من شهر" type="month" value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} />
        <Input label="إلى شهر" type="month" value={toMonth} onChange={(e) => setToMonth(e.target.value)} />
        <Select label="النوع" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">الكل</option>
          <option value="income">إيراد</option>
          <option value="expense">مصروف</option>
          <option value="transfer">تحويل</option>
        </Select>
        <Select label="البنك" value={bankFilter} onChange={(e) => setBankFilter(e.target.value)}>
          <option value="">الكل</option>
          {banks.map((b) => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
        </Select>
        <Select label="البند" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">الكل</option>
          {categories.filter((c) => c.type !== 'activity').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={() => { setFromMonth(''); setToMonth(''); setTypeFilter(''); setBankFilter(''); setCategoryFilter(''); }}>
            <Filter size={14} className="inline ml-1" /> مسح
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5"><p className="text-xs text-slate-500 font-semibold">إجمالي الإيرادات</p><p className="text-2xl font-extrabold text-brand-700 mt-1">{income.toLocaleString('ar-EG')} ج.م</p></div>
        <div className="card p-5"><p className="text-xs text-slate-500 font-semibold">إجمالي المصروفات</p><p className="text-2xl font-extrabold text-red-700 mt-1">{expense.toLocaleString('ar-EG')} ج.م</p></div>
        <div className="card p-5"><p className="text-xs text-slate-500 font-semibold">الصافي</p><p className={`text-2xl font-extrabold mt-1 ${income - expense >= 0 ? 'text-brand-700' : 'text-red-700'}`}>{(income - expense).toLocaleString('ar-EG')} ج.م</p></div>
      </div>

      {/* التبويبات */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${tab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {tab === 'byCategory' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-right font-bold text-slate-600">النوع</th>
                <th className="p-3 text-right font-bold text-slate-600">البند</th>
                <th className="p-3 text-right font-bold text-slate-600">الإجمالي</th>
                <th className="p-3 text-right font-bold text-slate-600">عدد الحركات</th>
                <th className="p-3 text-right font-bold text-slate-600">النسبة</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map((r, i) => {
                const total = r.type === 'income' ? income : expense;
                return (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="p-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${r.type === 'income' ? 'bg-brand-100 text-brand-700' : 'bg-red-100 text-red-700'}`}>{r.type === 'income' ? 'إيراد' : 'مصروف'}</span></td>
                    <td className="p-3 font-semibold">{r.name}</td>
                    <td className="p-3 font-bold">{r.total.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3">{r.count}</td>
                    <td className="p-3 text-slate-500">{total ? ((r.total / total) * 100).toFixed(1) : 0}%</td>
                  </tr>
                );
              })}
              {byCategory.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد بيانات</td></tr>}
            </tbody>
          </table>
        )}

        {tab === 'byMonth' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-right font-bold text-slate-600">الشهر</th>
                <th className="p-3 text-right font-bold text-slate-600">إيرادات</th>
                <th className="p-3 text-right font-bold text-slate-600">مصروفات</th>
                <th className="p-3 text-right font-bold text-slate-600">الصافي</th>
              </tr>
            </thead>
            <tbody>
              {byMonth.map((r) => (
                <tr key={r.month} className="border-b border-slate-50">
                  <td className="p-3 font-semibold">{r.month}</td>
                  <td className="p-3 text-brand-700 font-bold">{r.income.toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-red-700 font-bold">{r.expense.toLocaleString('ar-EG')}</td>
                  <td className={`p-3 font-bold ${r.income - r.expense >= 0 ? 'text-brand-700' : 'text-red-700'}`}>{(r.income - r.expense).toLocaleString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'byBank' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-right font-bold text-slate-600">البنك</th>
                <th className="p-3 text-right font-bold text-slate-600">إيرادات</th>
                <th className="p-3 text-right font-bold text-slate-600">مصروفات</th>
                <th className="p-3 text-right font-bold text-slate-600">تحويلات واردة</th>
                <th className="p-3 text-right font-bold text-slate-600">تحويلات صادرة</th>
              </tr>
            </thead>
            <tbody>
              {byBank.map((r, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="p-3 font-semibold">{r.bank}</td>
                  <td className="p-3 text-brand-700">{r.income.toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-red-700">{r.expense.toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-amber-700">{r.transfersIn.toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-slate-600">{r.transfersOut.toLocaleString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'shortPeriod' && (
          <div className="p-4">
            <div className="flex items-end gap-3 mb-4">
              <Input label="عدد الأشهر" type="number" min="1" value={shortMonths} onChange={(e) => setShortMonths(e.target.value)} />
              <p className="text-xs text-slate-500 mb-2">يُحسب من شهر آخر حركة في النتائج المفلترة</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 text-right font-bold text-slate-600">البند</th>
                  <th className="p-3 text-right font-bold text-slate-600">الإجمالي</th>
                  <th className="p-3 text-right font-bold text-slate-600">عدد الحركات</th>
                  <th className="p-3 text-right font-bold text-slate-600">عدد الأشهر</th>
                  <th className="p-3 text-right font-bold text-slate-600">المتوسط</th>
                </tr>
              </thead>
              <tbody>
                {shortPeriod.map((r) => (
                  <tr key={r.name} className="border-b border-slate-50">
                    <td className="p-3 font-semibold">{r.name}</td>
                    <td className="p-3 text-red-700 font-bold">{r.total.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3">{r.count}</td>
                    <td className="p-3">{r.monthsCount}</td>
                    <td className="p-3 text-slate-600">{r.avg.toLocaleString('ar-EG', { maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {shortPeriod.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد مصروفات في هذه الفترة</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'topExpenses' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-right font-bold text-slate-600">#</th>
                <th className="p-3 text-right font-bold text-slate-600">الشهر</th>
                <th className="p-3 text-right font-bold text-slate-600">التاريخ</th>
                <th className="p-3 text-right font-bold text-slate-600">البند</th>
                <th className="p-3 text-right font-bold text-slate-600">البنك</th>
                <th className="p-3 text-right font-bold text-slate-600">المبلغ</th>
                <th className="p-3 text-right font-bold text-slate-600">الإيصال</th>
              </tr>
            </thead>
            <tbody>
              {topExpenses.map((t, i) => (
                <tr key={t.id} className="border-b border-slate-50">
                  <td className="p-3 text-slate-400">{i + 1}</td>
                  <td className="p-3 font-semibold">{monthOf(t)}</td>
                  <td className="p-3 text-slate-500">{t.transaction_date}</td>
                  <td className="p-3 font-semibold">{catName(t.category_id)}</td>
                  <td className="p-3 text-slate-500">{bankName(t.bank_account_id)}</td>
                  <td className="p-3 text-red-700 font-bold">{Number(t.amount).toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-xs font-mono text-slate-500">{t.receipt_number || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'cashflow' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-right font-bold text-slate-600">الشهر</th>
                <th className="p-3 text-right font-bold text-slate-600">تدفق داخل</th>
                <th className="p-3 text-right font-bold text-slate-600">تدفق خارج</th>
                <th className="p-3 text-right font-bold text-slate-600">صافي التدفق</th>
                <th className="p-3 text-right font-bold text-slate-600">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {cashflow.map((r) => (
                <tr key={r.month} className="border-b border-slate-50">
                  <td className="p-3 font-semibold">{r.month}</td>
                  <td className="p-3 text-brand-700">{r.income.toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-red-700">{r.expense.toLocaleString('ar-EG')}</td>
                  <td className={`p-3 font-bold ${r.net >= 0 ? 'text-brand-700' : 'text-red-700'}`}>{r.net.toLocaleString('ar-EG')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${r.net >= 0 ? 'bg-brand-100 text-brand-700' : 'bg-red-100 text-red-700'}`}>
                      {r.net >= 0 ? 'موجب' : 'سالب'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'summary' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-right font-bold text-slate-600">الشهر</th>
                <th className="p-3 text-right font-bold text-slate-600">التاريخ</th>
                <th className="p-3 text-right font-bold text-slate-600">النوع</th>
                <th className="p-3 text-right font-bold text-slate-600">البند</th>
                <th className="p-3 text-right font-bold text-slate-600">البنك</th>
                <th className="p-3 text-right font-bold text-slate-600">المبلغ</th>
                <th className="p-3 text-right font-bold text-slate-600">الإيصال</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-slate-50">
                  <td className="p-3 font-semibold">{monthOf(t)}</td>
                  <td className="p-3 text-slate-500">{t.transaction_date}</td>
                  <td className="p-3">{t.type === 'income' ? 'إيراد' : t.type === 'expense' ? 'مصروف' : 'تحويل'}</td>
                  <td className="p-3">{catName(t.category_id)}</td>
                  <td className="p-3">{bankName(t.bank_account_id)}</td>
                  <td className="p-3 font-bold">{Number(t.amount).toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-xs font-mono text-slate-500">{t.receipt_number || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}