import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function AIInsightCard({ insight, title = 'AI Insight', delay = 0 }) {
  if (!insight) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(94,92,230,0.14) 0%, rgba(10,132,255,0.09) 100%)',
        border: '1px solid rgba(94,92,230,0.28)',
        boxShadow: '0 0 20px rgba(94,92,230,0.15), 0 4px 24px rgba(94,92,230,0.08)',
      }}
    >
      {/* Top shimmer */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(94,92,230,0.5), transparent)' }} />

      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(94,92,230,0.2)' }}>
          <Sparkles size={11} color="#5e5ce6" strokeWidth={2} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#5e5ce6' }}>{title}</span>
      </div>
      <p className="text-[13px] leading-relaxed font-medium" style={{ color: '#e5e5ea' }}>{insight}</p>
    </motion.div>
  )
}
