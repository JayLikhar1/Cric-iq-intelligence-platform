import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, ChevronDown, Zap, Shield, AlertTriangle, Target } from 'lucide-react'
import { strategyAPI, playersAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'

const VENUES = ['Narendra Modi Stadium','Wankhede Stadium','Eden Gardens','M.A. Chidambaram Stadium','Arun Jaitley Stadium','R. Premadasa Stadium','Pallekele Cricket Stadium']

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-[11px] uppercase tracking-widest mb-2 block" style={{ color: '#48484a' }}>{label}</label>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-white appearance-none outline-none cursor-pointer"
        style={{ background: 'rgba(44,44,46,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {options.map(o => <option key={o} value={o} className="bg-[#1c1c1e]">{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#48484a' }} />
    </div>
  </div>
)

const roleColor = (role) => {
  if (role?.includes('Wicketkeeper')) return { color: '#ffd60a', bg: 'rgba(255,214,10,0.1)' }
  if (role === 'Batter') return { color: '#0a84ff', bg: 'rgba(10,132,255,0.1)' }
  if (role === 'Bowler') return { color: '#ff453a', bg: 'rgba(255,69,58,0.1)' }
  return { color: '#30d158', bg: 'rgba(48,209,88,0.1)' }
}

export default function Strategy() {
  const { data: teams } = useFetch(playersAPI.getTeamsList)
  const [teamA, setTeamA] = useState('India')
  const [teamB, setTeamB] = useState('New Zealand')
  const [venue, setVenue] = useState('Narendra Modi Stadium')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const res = await strategyAPI.getBestXI(teamA, teamB, venue)
      setResult(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Strategy Lab" subtitle="AI-powered team selection · Batting order · Bowling plans" icon={FlaskConical} accent="#bf5af2" />

      {/* Config Panel */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <Select label="Your Team" value={teamA} onChange={setTeamA} options={teams || []} />
          <Select label="Opposition" value={teamB} onChange={setTeamB} options={teams || []} />
          <Select label="Venue" value={venue} onChange={setVenue} options={VENUES} />
        </div>
        <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
          onClick={run} disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-[14px] relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #bf5af2, #5e5ce6)', boxShadow: '0 4px 20px rgba(191,90,242,0.25)' }}>
          <div className="absolute inset-0 shimmer" />
          <span className="relative">{loading ? 'Generating Strategy...' : '⚡  Generate Best XI & Strategy'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <AIInsightCard insight={result.insight} title="Strategy Intelligence" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
              {/* Best XI */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.15)' }}>
                    <Zap size={12} color="#0a84ff" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white">Best XI — {result.team}</h3>
                </div>
                <div className="space-y-1.5">
                  {result.best_xi?.map((p, i) => {
                    const rc = roleColor(p.role)
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between py-2 px-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold w-5 text-center" style={{ color: '#48484a' }}>{i + 1}</span>
                          <span className="text-[13px] text-white">{p.player}</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{ color: rc.color, background: rc.bg }}>{p.role}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Batting Order */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.15)' }}>
                    <Shield size={12} color="#30d158" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white">Batting Order</h3>
                </div>
                <div className="space-y-1.5">
                  {result.batting_order?.map((p, i) => {
                    const rc = roleColor(p.role)
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 py-2 px-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-[12px] font-bold w-5 text-center rounded-md" style={{ color: '#0a84ff' }}>#{p.position}</span>
                        <span className="text-[13px] text-white flex-1">{p.player}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: rc.color, background: rc.bg }}>{p.role}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bowling Plan */}
            {result.bowling_plan && (
              <div className="rounded-2xl p-5 mt-4" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,69,58,0.15)' }}>
                    <Target size={12} color="#ff453a" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white">Bowling Plan vs {result.vs}</h3>
                  <span className="text-[11px] px-2.5 py-1 rounded-full ml-auto" style={{ background: 'rgba(255,255,255,0.06)', color: '#8e8e93' }}>
                    {result.bowling_plan.pitch_type}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { phase: 'Powerplay', overs: '1–6', bowlers: result.bowling_plan.powerplay, color: '#0a84ff' },
                    { phase: 'Middle', overs: '7–15', bowlers: result.bowling_plan.middle_overs, color: '#bf5af2' },
                    { phase: 'Death', overs: '16–20', bowlers: result.bowling_plan.death_overs, color: '#ff453a' },
                  ].map(({ phase, overs, bowlers, color }) => (
                    <div key={phase} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}15` }}>
                      <div className="text-[11px] font-semibold mb-0.5" style={{ color }}>{phase}</div>
                      <div className="text-[10px] mb-2" style={{ color: '#48484a' }}>Overs {overs}</div>
                      {bowlers?.length ? bowlers.map(b => (
                        <div key={b} className="text-[12px] text-white py-0.5">{b}</div>
                      )) : <div className="text-[12px]" style={{ color: '#48484a' }}>—</div>}
                    </div>
                  ))}
                </div>
                <AIInsightCard insight={result.bowling_plan.insight} title="Bowling Strategy" />
              </div>
            )}

            {/* Opposition Weakness */}
            {result.opposition_weakness && (
              <div className="rounded-2xl p-5 mt-4" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,159,10,0.15)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,159,10,0.15)' }}>
                    <AlertTriangle size={12} color="#ff9f0a" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white">Opposition Weakness — {result.vs}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Avg Batting SR', value: result.opposition_weakness.avg_batting_sr, color: '#0a84ff' },
                    { label: 'Avg Bowling Economy', value: result.opposition_weakness.avg_bowling_economy, color: '#ff453a' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="text-[20px] font-bold" style={{ color }}>{value}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#48484a' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {result.opposition_weakness.weaknesses?.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-[13px] py-1.5 px-3 rounded-xl" style={{ background: 'rgba(255,159,10,0.06)', color: '#ff9f0a' }}>
                      <span className="mt-0.5 flex-shrink-0">⚠</span> {w}
                    </div>
                  ))}
                  {result.opposition_weakness.recommendations?.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-[13px] py-1.5 px-3 rounded-xl" style={{ background: 'rgba(48,209,88,0.06)', color: '#30d158' }}>
                      <span className="mt-0.5 flex-shrink-0">→</span> {r}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
