export default function ImpactBadge({ score }) {
  const config = score >= 70
    ? { label: 'Elite',  color: '#30d158', bg: 'rgba(48,209,88,0.12)',   border: 'rgba(48,209,88,0.3)',   glow: '0 0 10px rgba(48,209,88,0.4)' }
    : score >= 45
    ? { label: 'Strong', color: '#0a84ff', bg: 'rgba(10,132,255,0.12)',  border: 'rgba(10,132,255,0.3)',  glow: '0 0 10px rgba(10,132,255,0.4)' }
    : score >= 25
    ? { label: 'Decent', color: '#ff9f0a', bg: 'rgba(255,159,10,0.12)',  border: 'rgba(255,159,10,0.3)',  glow: '0 0 10px rgba(255,159,10,0.4)' }
    : { label: 'Dev',    color: '#636366', bg: 'rgba(99,99,102,0.12)',   border: 'rgba(99,99,102,0.25)',  glow: 'none' }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}`, boxShadow: config.glow }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label} · {score}
    </span>
  )
}
