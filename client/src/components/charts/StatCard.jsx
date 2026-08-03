export default function StatCard({ label, value, accent = false }) {
  return (
    <div className={`card p-4 text-center ${accent ? 'bg-gradient-to-br from-brand-50 to-white border-brand-100' : ''}`}>
      <div className={`text-2xl font-bold tracking-tight ${accent ? 'text-brand-700' : 'text-slate-800'}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
