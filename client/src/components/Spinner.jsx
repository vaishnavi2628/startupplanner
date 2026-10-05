export default function Spinner({ full = false, text }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-muted ${full ? 'min-h-[60vh]' : 'py-10'}`} role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-pine motion-reduce:animate-none" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
