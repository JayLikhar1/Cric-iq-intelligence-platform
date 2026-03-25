import { motion } from 'framer-motion'
import { Trophy, Star } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { advancedAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import GlassCard from '../components/GlassCard'
import StatNumber from '../components/StatNumber'

const RECORD_ICONS = {
  'Most Runs': '🏏', 'Highest Strike Rate': '⚡', 'Most Sixes': '💥',
  'Most Wickets': '🎯', 'Best Economy': '🔒', 'Best Bowling Figures': '🔥',
  'Highest Individual Innings': '⭐', 'Most Boundaries': '🚀',
}

const RECORD_COLORS = {
  'Most Runs': '#0a84ff', 'Highest Strike Rate': '#ff9f0a', 'Most Sixes': '#bf5af2',
  'Most Wickets': '#ff453a', 'Best Economy': '#30d158', 'Best Bowling Figures': '#ff453a',
  'Highest Individual Innings': '#ffd60a', 'Most Boundaries': '#64d2ff',
}

export default function Records() {
  const { data: records, loading: rLoading } = useFetch(advancedAPI.getRecords)
  const { data: centuries, loading: cLoading } = useFetch(advancedAPI.getCenturies)

  if (rLoading || cLoading) return <LoadingSpinner text="Loading records..." />

  return (
    <div>
      <PageHeader title="Records Wall" subtitle="Tournament records, milestones and century tracker" icon={Trophy} accent="#ffd60a" />

      {/* Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-10">
        {records?.map((r, i) => {
          const color = RECORD_COLORS[r.category] || '#8e8e93'
          return (
            <GlassCard key={i} delay={i * 0.06} accent={color + '55'}
              style={{
                background: `linear-gradient(135deg, ${color}0e 0%, rgba(28,28,30,0.92) 100%)`,
                border: `1px solid ${color}28`,
                boxShadow: `0 0 20px ${color}0c, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="text-[32px] w-12 text-center flex-shrink-0 select-none">
                  {RECORD_ICONS[r.category] || '🏆'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-widest mb-0.5 font-semibold" style={{ color }}>
                    {r.category}
                  </div>
                  <div className="text-[20px] font-bold text-white" style={{ textShadow: `0 0 20px ${color}55` }}>
                    {r.record}
                  </div>
                  <div className="text-[13px] font-semibold mt-0.5" style={{ color: '#e5e5ea' }}>
                    {r.holder} <span style={{ color: '#636366' }}>· {r.team}</span>
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#48484a' }}>{r.detail}</div>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Century Tracker */}
      <div className="mb-3 flex items-center gap-2">
        <Star size={14} color="#ffd60a" style={{ filter: 'drop-shadow(0 0 6px rgba(255,214,10,0.7))' }} />
        <h2 className="text-[17px] font-bold text-white">Century Tracker</h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold ml-1"
          style={{ background: 'rgba(255,214,10,0.12)', color: '#ffd60a', border: '1px solid rgba(255,214,10,0.25)', boxShadow: '0 0 10px rgba(255,214,10,0.2)' }}>
          {centuries?.length || 0} centuries
        </span>
      </div>
      <p className="text-[12px] mb-5" style={{ color: '#636366' }}>Most centuries in any single T20 World Cup edition</p>

      <div className="space-y-3">
        {centuries?.map((c, i) => (
          <GlassCard key={i} delay={i * 0.08} accent="rgba(255,214,10,0.45)" hover={false}
            style={{ border: '1px solid rgba(255,214,10,0.14)', boxShadow: '0 0 20px rgba(255,214,10,0.06), inset 0 1px 0 rgba(255,255,255,0.06)' }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[16px] font-bold text-white">{c.player}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: '#636366' }}>{c.team} · {c.match}</div>
                </div>
                <div className="text-right">
                  <div className="text-[28px] font-bold" style={{ color: '#ffd60a', textShadow: '0 0 24px rgba(255,214,10,0.65)' }}>
                    {c.runs}
                  </div>
                  {c.balls && (
                    <div className="text-[11px]" style={{ color: '#48484a' }}>{c.balls} balls · SR {c.strike_rate}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Fours',      value: c.fours,           color: '#0a84ff' },
                  { label: 'Sixes',      value: c.sixes,           color: '#bf5af2' },
                  { label: 'Boundary %', value: `${c.boundary_pct}%`, color: '#30d158' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-2.5 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-[16px] font-bold" style={{ color, textShadow: `0 0 10px ${color}50` }}>
                      {value}
                    </div>
                    <div className="text-[10px] mt-0.5 uppercase tracking-widest" style={{ color: '#48484a' }}>{label}</div>
                  </div>
                ))}
              </div>

              <AIInsightCard insight={c.insight} title="Innings Intelligence" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
