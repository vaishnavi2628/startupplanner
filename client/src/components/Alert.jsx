export default function Alert({ children, tone = 'error' }) {
  if (!children) return null;
  const cls = tone === 'error' ? 'border-rose/30 bg-rose-soft text-rose' : 'border-pine/30 bg-pine-soft text-pine-dark';
  return <div role="alert" className={`rounded-lg border px-3.5 py-2.5 text-sm ${cls}`}>{children}</div>;
}
