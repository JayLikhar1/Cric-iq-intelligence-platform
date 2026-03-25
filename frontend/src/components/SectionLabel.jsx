export default function SectionLabel({ children, icon: Icon, color = '#48484a' }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={13} style={{ color }} />}
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color }}>
        {children}
      </span>
    </div>
  )
}
