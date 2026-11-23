export default function KpiCard({ title, value, icon: Icon, color = 'brand', suffix = 'ج.م' }) {
  const colors = {
    brand: 'from-brand-500 to-brand-600 text-brand-600 bg-brand-50',
    navy: 'from-navy-700 to-navy-800 text-navy-700 bg-slate-100',
    amber: 'from-amber-400 to-amber-500 text-amber-600 bg-amber-50',
    red: 'from-red-500 to-red-600 text-red-600 bg-red-50',
  };
  return (
    <div className="card p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-navy-800">
            {Number(value || 0).toLocaleString('ar-EG')} <span className="text-sm font-medium text-slate-400">{suffix}</span>
          </p>
        </div>
        <div className={`p-3 rounded-2xl ${colors[color].split(' ').slice(2).join(' ')}`}>
          {Icon && <Icon size={24} className={colors[color].split(' ')[1]} />}
        </div>
      </div>
    </div>
  );
}