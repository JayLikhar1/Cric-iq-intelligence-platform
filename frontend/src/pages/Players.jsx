import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Search, X } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { playersAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import ImpactBadge from '../components/ImpactBadge'
import GlassCard from '../components/GlassCard'
import StatNumber from '../components/StatNumber'

export default function Players() {
  const { data: leaderboard, loading } = useFetch(playersAPI.getLeaderboard)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  if (loading) return <LoadingSpinner text="Loading player intelligence..." />

  const filtered = leaderboard?.filter(p =>
    p.player.toLowerCase().includes(search.toLowerCase()) ||
    p.team.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div>
      <PageHeader title="Player Intelligence" subtitle="Impact scores, form trends and deep profiles" icon={User} accent="#5e5ce6" />

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#48484a' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search players or teams..."
          className="w-full rounded-2xl pl-9 pr-4 py-3 text-[14px] text-white outline-none"
          style={{ background: 'rgba(28,28,30,0.85)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#5e5ce6',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(94,92,230,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(94,92,230,0.1), inset 0 1px 0 rgba(255,255,255,0.05)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X size={14} color="#48484a" />
          </button>
        )}
      </div>

      {/* Player Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl p-6 mb-6 relative overflow-hidden"
            style={{
              background: 'rgba(28,28,30,0.95)',
              border: '1px solid rgba(94,92,230,0.25)',
              boxShadow: '0 0 30px rgba(94,92,230,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(94,92,230,0.7),transparent)' }} />

            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[18px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,rgba(94,92,230,0.35),rgba(10,132,255,0.25))', boxShadow: '0 0 20px rgba(94,92,230,0.3)' }}>
                  {selected.player[0]}
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-white tracking-tight">{selected.player}</h2>
                  <div className="text-[13px] mt-0.5" style={{ color: '#636366' }}>{selected.team}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ImpactBadge score={selected.impact_score} />
                <button onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X size={13} color="#8e8e93" />
                </button>
              </div>
            </div>

            {selected.batting && (
              <div className="mb-4">
                <div className="text-[11px] uppercase tracking-widest mb-3 font-semibold" style={{ color: '#48484a' }}>Batting</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Runs',      value: selected.batting.runs,         color: '#0a84ff' },
                    { label: 'Average',   value: selected.batting.average,      color: '#30d158' },
                    { label: 'Strike Rate',value: selected.batting.strike_rate, color: '#ff9f0a' },
                    { label: '50s / 100s',value: `${selected.batting.fifties}/${selected.batting.hundreds}`, color: '#bf5af2' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <StatNumber value={s.value} label={s.label} color={s.color} size="md" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.bowling && (
              <div className="mb-4">
                <div className="text-[11px] uppercase tracking-widest mb-3 font-semibold" style={{ color: '#48484a' }}>Bowling</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Wickets', value: selected.bowling.wickets,  color: '#ff453a' },
                    { label: 'Economy', value: selected.bowling.economy,  color: '#64d2ff' },
                    { label: 'Average', value: selected.bowling.average,  color: '#ff9f0a' },
                    { label: 'Best',    value: selected.bowling.best_figures, color: '#bf5af2' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <StatNumber value={s.value || '—'} label={s.label} color={s.color} size="md" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.batting_insight && <AIInsightCard insight={selected.batting_insight} title="Batting Intelligence" />}
            {selected.bowling_insight && <div className="mt-3"><AIInsightCard insight={selected.bowling_insight} title="Bowling Intelligence" /></div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard */}
      <GlassCard accent="rgba(94,92,230,0.4)" hover={false}>
        <div className="grid grid-cols-12 gap-2 px-5 py-3" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          {['#','Player','Runs','Wickets','Impact'].map((h, i) => (
            <div key={h} className={`text-[11px] uppercase tracking-widest font-semibold ${i===0?'col-span-1':i===1?'col-span-4':'col-span-2'}`}
              style={{ color: '#48484a' }}>{h}</div>
          ))}
        </div>
        {filtered.slice(0, 25).map((p, i) => (
          <motion.div key={p.player}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: i * 0.018, duration: 0.3 }}
            onClick={() => setSelected(selected?.player === p.player ? null : p)}
            className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center cursor-pointer"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}
            whileHover={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="col-span-1 text-[12px] font-bold" style={{ color: '#48484a' }}>{i + 1}</div>
            <div className="col-span-4">
              <div className="text-[13px] font-semibold text-white">{p.player}</div>
              <div className="text-[11px]" style={{ color: '#636366' }}>{p.team}</div>
            </div>
            <div className="col-span-2 text-[14px] font-bold" style={{ color: '#0a84ff', textShadow: '0 0 10px rgba(10,132,255,0.4)' }}>{p.batting?.runs || '—'}</div>
            <div className="col-span-2 text-[14px] font-bold" style={{ color: '#bf5af2', textShadow: '0 0 10px rgba(191,90,242,0.4)' }}>{p.bowling?.wickets || '—'}</div>
            <div className="col-span-3"><ImpactBadge score={p.impact_score} /></div>
          </motion.div>
        ))}
      </GlassCard>
    </div>
  )
}
