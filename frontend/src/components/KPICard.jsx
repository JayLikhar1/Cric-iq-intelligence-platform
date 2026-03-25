import { motion } from 'framer-motion'

const THEMES = {
  blue:   { accent: '#0a84ff', bg: 'rgba(10,132,255,0.10)',  border: 'rgba(10,132,255,0.22)', glow: '0 0 20px rgba(10,132,255,0.35), 0 0 60px rgba(10,132,255,0.12)' },
  green:  { accent: '#30d158', bg: 'rgba(48,209,88,0.10)',   border: 'rgba(48,209,88,0.22)',  glow: '0 0 20px rgba(48,209,88,0.35),  0 0 60px rgba(48,209,88,0.12)' },
  purple: { accent: '#bf5af2', bg: 'rgba(191,90,242,0.10)',  border: 'rgba(191,90,242,0.22)', glow: '0 0 20px rgba(191,90,242,0.35), 0 0 60px rgba(191,90,242,0.12)' },
  amber:  { accent: '#ff9f0a', bg: 'rgba(255,159,10,0.10)',  border: 'rgba(255,159,10,0.22)', glow: '0 0 20px rgba(255,159,10,0.35), 0 0 60px rgba(255,159,10,0.12)' },
  red:    { accent: '#ff453a', bg: 'rgba(255,69,58,0.10)',   border: 'rgba(255,69,58,0.22)',  glow: '0 0 20px rgba(255,69,58,0.35),  0 0 60px rgba(255,69,58,0.12)' },
  cyan:   { accent: '#64d2ff', bg: 'rgba(100,210,255,0.10)', border: 'rgba(100,210,255,0.22)',glow: '0 0 20px rgba(100,210,255,0.35),0 0 60px rgba(100,210,255,0.12)' },
  gold:   { accent: '#ffd60a', bg: 'rgba(255,214,10,0.10)',  border: 'rgba(255,214,10,0.22)', glow: '0 0 20px rgba(255,214,10,0.35), 0 0 60px rgba(255,214,10,0.12)' },
}

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', delay = 0 }) {
  const t = THEMES[color] || THEMES.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        y: -4, scale: 1.03,
        boxShadow: t.glow,
        borderColor: t.border,
        transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }
      }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-2xl p-5 overflow-hidden cursor-default"
      style={{
        background: `linear-gradient(135deg, ${t.bg} 0%, rgba(28,28,30,0.92) 100%)`,
        border: `1px solid ${t.border}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07)`,
      }}
    >
      {/* Top shine */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${t.accent}60, transparent)` }} />

      {/* Icon row */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#636366' }}>{title}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{ background: t.bg, boxShadow: `0 0 12px ${t.accent}30` }}>
            <Icon size={14} style={{ color: t.accent }} strokeWidth={2.2} />
          </div>
        )}
      </div>

      {/* Value — bright white with subtle text glow */}
      <div
        className="text-[27px] font-bold tracking-tight leading-none mb-1.5"
        style={{
          color: '#ffffff',
          fontFeatureSettings: '"tnum"',
          textShadow: `0 0 30px ${t.accent}50`,
        }}
      >
        {value ?? '—'}
      </div>

      {subtitle && (
        <div className="text-[12px]" style={{ color: '#8e8e93' }}>{subtitle}</div>
      )}

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${t.accent}70, transparent)` }} />
    </motion.div>
  )
}
