import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ChevronRight, Flame } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { matchesAPI, advancedAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import GlassCard from '../components/GlassCard'
import StatNumber from '../components/StatNumber'

const STAGES = ['All', 'Group', 'Super Eight', 'Semi-Final', 'Final']
const STAGE_STYLE = {
  Final:         { bg: 'rgba(255,214,10,0.1)',  color: '#ffd60a',  border: 'rgba(255,214,10,0.2)' },
  'Semi-Final':  { bg: 'rgba(191,90,242,0.1)', color: '#bf5af2',  border: 'rgba(191,90,242,0.2)' },
  'Super Eight': { bg: 'rgba(10,132,255,0.1)', color: '#0a84ff',  border: 'rgba(10,132,255,0.2)' },
  Group:         { bg: 'rgba(99,99,102,0.1)',  color: '#8e8e93',  border: 'rgba(99,99,102,0.2)' },
}

export default function Matches() {
  const { data: matches, loading } = useFetch(matchesAPI.getAll)
  const { data: toss } = useFetch(matchesAPI.getTossAnalysis)
  const { data: closest } = useFetch(advancedAPI.getClosestMatches)
  const [stage, setStage] = useState('All')
  const [selected, setSelected] = useState(null)

  if (loading) return <LoadingSpinner text="Loading matches..." />

  const filtered = stage === 'All' ? matches : matches?.filter(m => m.stage === stage)

  return (
    <div>
      <PageHeader title="Match Intelligence" subtitle="Full tournament timeline · 55 matches" icon={Activity} accent="#30d158" />

      {/* Toss Stats */}
      {toss && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Toss → Win Rate', value: `${toss.toss_win_percentage}%`, color: '#0a84ff' },
            { label: 'Bat First Wins',  value: toss.bat_first_wins,            color: '#30d158' },
            { label: 'Field First Wins',value: toss.field_first_wins,          color: '#ff9f0a' },
          ].map((item, i) => (
            <GlassCard key={i} delay={i * 0.07} accent={item.color + '50'}>
              <div className="p-4 text-center">
                <StatNumber value={item.value} label={item.label} color={item.color} size="lg" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {toss && <div className="mb-6"><AIInsightCard insight={toss.insight} title="Toss Intelligence" /></div>}

      {/* Stage Filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {STAGES.map(s => (
          <motion.button key={s} onClick={() => setStage(s)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="px-3.5 py-1.5 rounded-full text-[12px] font-medium"
            style={stage === s
              ? { background: 'rgba(10,132,255,0.15)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.3)', boxShadow: '0 0 12px rgba(10,132,255,0.2)' }
              : { background: 'rgba(255,255,255,0.05)', color: '#8e8e93', border: '1px solid rgba(255,255,255,0.08)' }
            }>{s}</motion.button>
        ))}
        <span className="text-[12px] ml-auto" style={{ color: '#48484a' }}>{filtered?.length} matches</span>
      </div>

      {/* Match List */}
      <div className="space-y-2">
        {filtered?.map((m, i) => {
          const ss = STAGE_STYLE[m.stage] || STAGE_STYLE.Group
          const isOpen = selected?.match_no === m.match_no
          return (
            <motion.div key={m.match_no}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.012, 0.25), duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={() => setSelected(isOpen ? null : m)}
              className="rounded-2xl overflow-hidden cursor-pointer relative"
              style={{
                background: 'rgba(28,28,30,0.75)',
                border: `1px solid ${isOpen ? 'rgba(10,132,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: isOpen ? '0 0 20px rgba(10,132,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
              whileHover={{ borderColor: 'rgba(255,255,255,0.13)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)' }}
            >
              {/* Top shine */}
              <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: isOpen ? 'linear-gradient(90deg,transparent,rgba(10,132,255,0.4),transparent)' : 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-bold w-6 text-center rounded-md py-0.5"
                    style={{ color: '#48484a', background: 'rgba(255,255,255,0.05)' }}>{m.match_no}</span>
                  <div>
                    <div className="text-[14px] font-semibold text-white">{m.team1} <span style={{ color: '#48484a' }}>vs</span> {m.team2}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#636366' }}>{m.venue} · {m.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, boxShadow: `0 0 8px ${ss.color}20` }}>
                    {m.stage}
                  </span>
                  <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={14} color="#48484a" />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div className="px-4 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: 'Winner', value: m.winner || 'No Result' },
                        { label: 'Margin', value: m.margin || '—' },
                        { label: 'Toss', value: m.toss_winner ? `${m.toss_winner} (${m.toss_decision || '—'})` : '—' },
                        { label: 'City', value: m.city },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#48484a' }}>{label}</div>
                          <div className="text-[13px] font-semibold text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                    {m.result && (
                      <div className="px-4 pb-4">
                        <div className="text-[12px] px-3 py-2 rounded-xl font-medium"
                          style={{ background: 'rgba(48,209,88,0.07)', color: '#30d158', border: '1px solid rgba(48,209,88,0.15)', boxShadow: '0 0 10px rgba(48,209,88,0.06)' }}>
                          {m.result}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Nail-Biters */}
      {closest?.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={15} color="#ff453a" style={{ filter: 'drop-shadow(0 0 6px rgba(255,69,58,0.6))' }} />
            <h2 className="text-[17px] font-bold text-white">Nail-Biters</h2>
          </div>
          <p className="text-[12px] mb-5" style={{ color: '#636366' }}>Closest matches ranked by winning margin</p>
          <div className="space-y-2">
            {closest.map((m, i) => (
              <GlassCard key={m.match_no} delay={i * 0.04} accent="rgba(255,69,58,0.3)" hover={false}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{m.team1} vs {m.team2}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#636366' }}>{m.venue} · {m.stage}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold" style={{ color: '#ff453a', textShadow: '0 0 14px rgba(255,69,58,0.6)' }}>{m.margin}</div>
                    <div className="text-[11px]" style={{ color: '#636366' }}>{m.winner}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
