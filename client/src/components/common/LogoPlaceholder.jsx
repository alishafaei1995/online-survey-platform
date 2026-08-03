export default function LogoPlaceholder({ className = 'h-8 w-8' }) {
  return (
    <div
      className={`${className} rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0`}
    >
      <span className="text-[9px] font-bold tracking-wide leading-none">LOGO</span>
    </div>
  );
}
