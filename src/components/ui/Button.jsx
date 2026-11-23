export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl transition-colors',
  };
  return (
    <button
      className={`${styles[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}