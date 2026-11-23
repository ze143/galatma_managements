export default function Select({ label, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select className="input-field" {...props}>{children}</select>
    </div>
  );
}