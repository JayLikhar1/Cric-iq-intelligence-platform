import { motion } from 'framer-motion'

/**
 * Reusable glass card with top shine, inset shadow, hover glow.
 * accent: hex color for the shine/glow. If omitted, uses white.
 */
export default function GlassCard({
  children, className = '', accent = 'rgba(255,255,255,0.08)',
  delay = 0, hover = true, onClick, style = {}
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -3, scale: 1.01, transition: { duration: 0.22, ease: [0.34, 1.56, 0.64, 1] } } : undefined}
      whileTap={hover ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'rgba(28,28,30,0.82)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {/* Top shine line */}
      <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      {children}
    </motion.div>
  )
}
