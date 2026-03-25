import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { awardsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'

const AWARD_META = {
  'Player of the Tournament':          { icon: '🏆', color: '#ffd60a' },
  'Most Runs':                         { icon: '🏏', color: '#0a84ff' },
  'Most Wickets (Joint)':              { icon: '🎯', color: '#bf5af2' },
  'Fastest Century':                   { icon: '⚡', color: '#ff9f0a' },
  'Best Bowling Figures':              { icon: '🔥', color: '#ff453a' },
  'Highest Individual Score in Final': { icon: '⭐', color: '#30d158' },
  'Highest Team Total in Final':       { icon: '📊', color: '#64d2ff' },
}

export default function Awards() {
  const { data, loading } = useFetch(awardsAPI.getSummary)

  if (loading) return <LoadingSpinner text="Loading awards..." />

  return (
    <div>
      <PageHeader title="Awards" subtitle="Tournament honours and record-breaking performances" icon={Trophy} accent="#ffd60a" />

      {/* Champion Banner */}
      {data && (
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl p-6 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,rgba(255,214,10,0.12) 0%,rgba(255,159,10,0.07) 100%)',
            border: '1px solid rgba(255,214,10,0.25)',
            boxShadow: '0 0 40px rgba(255,214,10,0.1), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,214,10,0.7),transparent)' }} />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[80px] opacity-10 select-none">🏆</div>
          <div className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#ffd60a' }}>Tournament Champion</div>
          <div className="text-[32px] font-bold text-white tracking-tight"
            style={{ textShadow: '0 0 30px rgba(255,214,10,0.5)' }}>{data.winner}</div>
          <div className="text-[14px] mt-1" style={{ color: '#8e8e93' }}>{data.final_score}</div>
          {data.notable_records && (
            <div className="mt-3 text-[12px] leading-relaxed" style={{ color: '#636366' }}>{data.notable_records}</div>
          )}
        </motion.div>
      )}

      {/* Awards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {data?.awards?.map((award, i) => {
          const meta = AWARD_META[award.award] || { icon: '🎖️', color: '#8e8e93' }
          return (
            <GlassCard key={i} delay={i * 0.07} accent={meta.color + '50'}
              style={{
                background: `linear-gradient(135deg,${meta.color}0d 0%,rgba(28,28,30,0.92) 100%)`,
                border: `1px solid ${meta.color}22`,
                boxShadow: `0 0 20px ${meta.color}0a, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}>
              <div className="flex items-center gap-4 p-4">
                <div className="text-[32px] w-12 text-center flex-shrink-0">{meta.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-widest mb-0.5 font-semibold" style={{ color: meta.color }}>{award.award}</div>
                  <div className="text-[16px] font-bold text-white truncate"
                    style={{ textShadow: `0 0 16px ${meta.color}40` }}>{award.player_or_detail}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: '#636366' }}>{award.team}</div>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
