import { useMemo, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Landmark, Award } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import KpiCard from '../components/KpiCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useData } from '../context/DataContext';

const COLORS = ['#059669', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6'];

export default function Dashboard() {
  const { banks, transactions, categories, activities, getBankTotals, monthOf } = useData();
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');

  const filteredTx = useMemo(() => transactions.filter((t) => {
    const m = monthOf(t);
    if (fromMonth && m < fromMonth) return false;
    if (toMonth && m > toMonth) return false;
    return true;
  }), [transactions, fromMonth, toMonth, monthOf]);

  const bankTotals = getBankTotals();

  const kpis = useMemo(() => {
    const totalOpening = banks.reduce((s, b) => s + Number(b.opening_balance), 0);
    const totalIncome = filteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = filteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const totalCurrent = bankTotals.reduce((s, b) => s + Number(b.current_balance), 0);
    return { totalOpening, totalIncome, totalExpense, totalCurrent };
  }, [banks, filteredTx, bankTotals]);

  const monthlyData = useMemo(() => {
    const map = {};
    filteredTx.forEach((t) => {
      if (t.type === 'transfer') return;
      const m = monthOf(t);
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 };
      map[m][t.type] += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTx, monthOf]);

  const expenseByCategory = useMemo(() => {
    const map = {};
    filteredTx.filter((t) => t.type === 'expense').forEach((t) => {
      const c = categories.find((x) => x.id === t.category_id);
      const name = c?.name || 'غير مصنف';
      map[name] = (map[name] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTx, categories]);

  const activitiesByCategory = useMemo(() => {
    const map = {};
    activities.forEach((a) => {
      if (fromMonth && monthOf(a) < fromMonth) return;
      if (toMonth && monthOf(a) > toMonth) return;
      map[a.category] = (map[a.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activities, fromMonth, toMonth, monthOf]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-800">لوحة القيادة التنفيذية</h1>
        <p className="text-sm text-slate-500 mt-1">نظرة شاملة على الوضع المالي وأنشطة المركز</p>
      </div>

      <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="من شهر" type="month" value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} />
        <Input label="إلى شهر" type="month" value={toMonth} onChange={(e) => setToMonth(e.target.value)} />
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={() => { setFromMonth(''); setToMonth(''); }}>مسح الفلتر</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="الرصيد الافتتاحي الإجمالي" value={kpis.totalOpening} icon={Landmark} color="navy" />
        <KpiCard title="إجمالي الإيرادات" value={kpis.totalIncome} icon={TrendingUp} color="brand" />
        <KpiCard title="إجمالي المصروفات" value={kpis.totalExpense} icon={TrendingDown} color="red" />
        <KpiCard title="الرصيد البنكي الحالي" value={kpis.totalCurrent} icon={Wallet} color="amber" />
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-navy-800 mb-4 flex items-center gap-2"><Landmark size={18} /> أرصدة الحسابات البنكية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {bankTotals.map((b) => (
            <div key={b.id} className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-brand-50/50 border border-slate-100">
              <p className="font-bold text-navy-800">{b.bank_name}</p>
              <p className="text-xs text-slate-500 font-mono">{b.account_number}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">الرصيد الحالي</span>
                <span className="text-lg font-extrabold text-brand-700">{Number(b.current_balance).toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex justify-between text-slate-500">
                <span>افتتاحي: {Number(b.opening_balance).toLocaleString('ar-EG')}</span>
                <span>+{Number(b.total_income).toLocaleString('ar-EG')} / -{Number(b.total_expense).toLocaleString('ar-EG')}</span>
              </div>
            </div>
          ))}
          {bankTotals.length === 0 && <p className="text-sm text-slate-400 col-span-full text-center py-4">لا توجد حسابات بنكية مسجلة بعد</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-bold text-navy-800 mb-4">الإيرادات مقابل المصروفات شهرياً</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', borderRadius: 12 }} />
              <Bar dataKey="income" name="إيرادات" fill="#059669" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="مصروفات" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-navy-800 mb-4">توزيع المصروفات حسب البنود</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
                {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-navy-800 mb-4 flex items-center gap-2"><Award size={18} /> توزيع الأنشطة حسب الفئات</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={activitiesByCategory} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontFamily: 'Cairo' }} width={100} />
            <Tooltip contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', borderRadius: 12 }} />
            <Bar dataKey="value" name="عدد الأنشطة" fill="#F59E0B" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}