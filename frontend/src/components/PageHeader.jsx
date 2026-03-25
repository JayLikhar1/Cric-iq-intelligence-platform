import { motion } from 'framer-motion'

export default function PageHeader({ title, subtitle, icon: Icon, accent = '#0a84ff' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-1">
        {Icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center"
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}35`,
              boxShadow: `0 0 16px ${accent}40, 0 0 40px ${accent}15`,
            }}
          >
            <Icon size={17} style={{ color: accent }} strokeWidth={2} />
          </motion.div>
        )}
        <h1 className="text-[28px] font-bold tracking-tight"
          style={{ color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.15)' }}>{title}</h1>
      </div>
      {subtitle && (
        <p className="text-[13px] ml-12" style={{ color: '#636366' }}>{subtitle}</p>
      )}
    </motion.div>
  )
}
