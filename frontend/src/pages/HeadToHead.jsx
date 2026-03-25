import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, ChevronDown } from 'lucide-react'
import { advancedAPI, playersAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import GlassCard from '../components/GlassCard'
import StatNumber from '../components/StatNumber'

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-[11px] uppercase tracking-widest mb-2 block" style={{ color: '#48484a' }}>{label}</label>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-white appearance-none outline-none"
        style={{ background: 'rgba(44,44,46,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {options.map(o => <option key={o} value={o} className="bg-[#1c1c1e]">{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#48484a' }} />
    </div>
  </div>
)

export default function HeadToHead() {
  const { data: teams } = useFetch(playersAPI.getTeamsList)
  const { data: streaks, loading: sLoading } = useFetch(advancedAPI.getStreaks)
  const [teamA, setTeamA] = useState('India')
  const [teamB, setTeamB] = useState('New Zealand')
  const [h2h, setH2h] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try { const r = await advancedAPI.getHeadToHead(teamA, teamB); setH2h(r.data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Head-to-Head" subtitle="Team matchups, winning streaks and form analysis" icon={Swords} accent="#ff453a" />

      {/* H2H Selector */}
      <GlassCard accent="rgba(255,69,58,0.4)" hover={false} className="mb-6">
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Select label="Team A" value={teamA} onChange={setTeamA} options={teams || []} />
            <Select label="Team B" value={teamB} onChange={setTeamB} options={teams || []} />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={fetch} disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-[13px] font-semibold"
            style={{ background: 'linear-gradient(135deg,#ff453a,#ff6b6b)', boxShadow: '0 4px 16px rgba(255,69,58,0.3)' }}>
            {loading ? 'Loading...' : '⚔  Compare Teams'}
          </motion.button>
        </div>
      </GlassCard>

      <AnimatePresence>
        {h2h && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>

            {/* Score Card */}
            <GlassCard accent="rgba(255,69,58,0.5)" hover={false} className="mb-5"
              style={{ border: '1px solid rgba(255,69,58,0.22)', boxShadow: '0 0 30px rgba(255,69,58,0.1), inset 0 1px 0 rgba(255,255,255,0.07)' }}>
              <div className="p-6 grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <div className="text-[13px] font-semibold mb-2" style={{ color: '#636366' }}>{h2h.team_a}</div>
                  <StatNumber value={h2h.team_a_wins} color="#0a84ff" size="xl" />
                  <div className="text-[11px] mt-1" style={{ color: '#48484a' }}>wins</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: '#48484a' }}>vs</div>
                  <div className="text-[13px] font-semibold text-white">{h2h.total_matches} match{h2h.total_matches !== 1 ? 'es' : ''}</div>
                  {h2h.no_result > 0 && <div className="text-[11px] mt-1" style={{ color: '#636366' }}>{h2h.no_result} NR</div>}
                </div>
                <div className="text-center">
                  <div className="text-[13px] font-semibold mb-2" style={{ color: '#636366' }}>{h2h.team_b}</div>
                  <StatNumber value={h2h.team_b_wins} color="#30d158" size="xl" />
                  <div className="text-[11px] mt-1" style={{ color: '#48484a' }}>wins</div>
                </div>
              </div>
            </GlassCard>

            <AIInsightCard insight={h2h.insight} title="Head-to-Head Intelligence" />

            {/* Match List */}
            {h2h.matches?.length > 0 && (
              <div className="mt-5 space-y-2">
                <h3 className="text-[13px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#48484a' }}>Encounters</h3>
                {h2h.matches.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="text-[13px] font-semibold text-white">{m.team1} vs {m.team2}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#636366' }}>{m.venue} · {m.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-semibold" style={{ color: m.winner === teamA ? '#0a84ff' : m.winner === teamB ? '#30d158' : '#636366' }}>
                        {m.winner || 'No Result'}
                      </div>
                      <div className="text-[11px]" style={{ color: '#48484a' }}>{m.margin}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winning Streaks */}
      <div className="mt-8">
        <h2 className="text-[17px] font-bold text-white mb-1">Winning Streaks</h2>
        <p className="text-[12px] mb-5" style={{ color: '#636366' }}>Longest consecutive wins in the tournament</p>
        {sLoading ? <LoadingSpinner text="Loading streaks..." /> : (
          <div className="space-y-2">
            {streaks?.slice(0, 10).map((s, i) => (
              <motion.div key={s.team} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl"
                style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold w-5" style={{ color: '#48484a' }}>{i + 1}</span>
                  <div>
                    <div className="text-[13px] font-semibold text-white">{s.team}</div>
                    <div className="flex gap-1 mt-1">
                      {s.form?.map((r, j) => (
                        <span key={j} className="text-[10px] w-5 h-5 rounded-md flex items-center justify-center font-bold"
                          style={{
                            background: r === 'W' ? 'rgba(48,209,88,0.15)' : r === 'L' ? 'rgba(255,69,58,0.15)' : 'rgba(255,255,255,0.05)',
                            color: r === 'W' ? '#30d158' : r === 'L' ? '#ff453a' : '#636366'
                          }}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-[18px] font-bold" style={{ color: '#ffd60a', textShadow: '0 0 15px rgba(255,214,10,0.5)' }}>{s.max_win_streak}</div>
                    <div className="text-[10px]" style={{ color: '#48484a' }}>best streak</div>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-white">{s.total_wins}W</div>
                    <div className="text-[10px]" style={{ color: '#48484a' }}>{s.total_losses}L</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
