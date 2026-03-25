import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, ChevronDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { predictAPI, playersAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import { CHART_COLORS } from '../utils/colors'

const VENUES = ['Narendra Modi Stadium','Wankhede Stadium','Eden Gardens','M.A. Chidambaram Stadium','Arun Jaitley Stadium','R. Premadasa Stadium','Pallekele Cricket Stadium']
const SF_TEAMS = ['India', 'New Zealand', 'England', 'South Africa']

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(28,28,30,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || '#f5f5f7' }}>{p.payload?.name || p.name}: <b>{p.value}%</b></div>)}
    </div>
  )
}

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

export default function Predict() {
  const { data: teams } = useFetch(playersAPI.getTeamsList)
  const [teamA, setTeamA] = useState('India')
  const [teamB, setTeamB] = useState('New Zealand')
  const [venue, setVenue] = useState('Narendra Modi Stadium')
  const [matchResult, setMatchResult] = useState(null)
  const [simResult, setSimResult] = useState(null)
  const [wpResult, setWpResult] = useState(null)
  const [score, setScore] = useState(100)
  const [overs, setOvers] = useState(10)
  const [wickets, setWickets] = useState(2)
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)

  const predictMatch = async () => {
    setLoading(true)
    try { const res = await predictAPI.predictMatch(teamA, teamB, venue); setMatchResult(res.data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const runSim = async () => {
    setLoading(true)
    try { const res = await predictAPI.predictTournament(SF_TEAMS); setSimResult(res.data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const calcWP = async () => {
    try { const res = await predictAPI.winProbability(score, overs, wickets, target || undefined); setWpResult(res.data) }
    catch (e) { console.error(e) }
  }

  const pieData = matchResult ? [
    { name: matchResult.team_a, value: matchResult.team_a_probability },
    { name: matchResult.team_b, value: matchResult.team_b_probability },
  ] : []

  const simChartData = simResult?.win_probabilities
    ? Object.entries(simResult.win_probabilities).map(([team, prob]) => ({ team, prob }))
    : []

  return (
    <div>
      <PageHeader title="Predictions" subtitle="Match winner · Monte Carlo simulation · Win probability" icon={TrendingUp} accent="#ff9f0a" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Match Predictor */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-[15px] font-semibold text-white mb-1">Match Predictor</h3>
          <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Probability-based winner prediction</p>
          <div className="space-y-3 mb-4">
            <Select label="Team A" value={teamA} onChange={setTeamA} options={teams || []} />
            <Select label="Team B" value={teamB} onChange={setTeamB} options={teams || []} />
            <Select label="Venue" value={venue} onChange={setVenue} options={VENUES} />
          </div>
          <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
            onClick={predictMatch} disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-[13px] font-semibold"
            style={{ background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)', boxShadow: '0 4px 16px rgba(10,132,255,0.2)' }}>
            Predict Winner
          </motion.button>

          <AnimatePresence>
            {matchResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                <div className="text-center mb-3">
                  <div className="text-[22px] font-bold" style={{ color: '#0a84ff', textShadow: '0 0 20px rgba(10,132,255,0.7)' }}>{matchResult.predicted_winner}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: '#636366' }}>Predicted Winner · {matchResult.confidence}% confidence</div>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={4} strokeWidth={0}>
                      <Cell fill="#0a84ff" fillOpacity={0.9} />
                      <Cell fill="rgba(255,255,255,0.08)" />
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-around text-[12px] mt-2">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? '#0a84ff' : 'rgba(255,255,255,0.15)' }} />
                      <span style={{ color: '#8e8e93' }}>{d.name}: <span className="text-white font-semibold">{d.value}%</span></span>
                    </div>
                  ))}
                </div>
                <div className="mt-3"><AIInsightCard insight={matchResult.insight} title="Prediction Insight" /></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tournament Simulation */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-[15px] font-semibold text-white mb-1">Tournament Simulation</h3>
          <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Monte Carlo · 2000 simulations</p>
          <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: '#48484a' }}>Semi-Final Teams</div>
            <div className="flex flex-wrap gap-2">
              {SF_TEAMS.map(t => (
                <span key={t} className="text-[12px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(10,132,255,0.1)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.2)' }}>{t}</span>
              ))}
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
            onClick={runSim} disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-[13px] font-semibold mb-4"
            style={{ background: 'linear-gradient(135deg, #30d158, #34c759)', boxShadow: '0 4px 16px rgba(48,209,88,0.2)' }}>
            Run Simulation
          </motion.button>

          {simResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-[11px] mb-2" style={{ color: '#48484a' }}>{simResult.simulation_runs} simulations completed</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={simChartData} margin={{ left: -25 }} barSize={28}>
                  <XAxis dataKey="team" tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#48484a', fontSize: 10 }} unit="%" axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="prob" radius={[6, 6, 0, 0]}>
                    {simChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>

      {/* Win Probability Engine */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-[15px] font-semibold text-white mb-1">Live Win Probability</h3>
        <p className="text-[12px] mb-5" style={{ color: '#636366' }}>Real-time match state analysis</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Current Score', value: score, set: setScore },
            { label: 'Overs Done', value: overs, set: setOvers, step: 0.1 },
            { label: 'Wickets Lost', value: wickets, set: setWickets },
            { label: 'Target (chase)', value: target, set: setTarget, placeholder: 'Leave blank for 1st inn' },
          ].map(({ label, value, set, step, placeholder }) => (
            <div key={label}>
              <label className="text-[11px] uppercase tracking-widest mb-1.5 block" style={{ color: '#48484a' }}>{label}</label>
              <input type="number" value={value} step={step} placeholder={placeholder}
                onChange={e => set(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white outline-none"
                style={{ background: 'rgba(44,44,46,0.8)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#0a84ff' }}
                onFocus={e => e.target.style.borderColor = 'rgba(10,132,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={calcWP}
          className="px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold"
          style={{ background: 'linear-gradient(135deg, #ff9f0a, #ff6b00)', boxShadow: '0 4px 16px rgba(255,159,10,0.2)' }}>
          Calculate
        </motion.button>

        <AnimatePresence>
          {wpResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Win Probability', value: `${wpResult.win_probability}%`, color: '#30d158', glow: '0 0 20px rgba(48,209,88,0.7)' },
                wpResult.projected_score && { label: 'Projected Score', value: wpResult.projected_score, color: '#0a84ff', glow: '0 0 20px rgba(10,132,255,0.7)' },
                wpResult.required_rate && { label: 'Required Rate', value: wpResult.required_rate, color: '#ff9f0a', glow: '0 0 20px rgba(255,159,10,0.7)' },
              ].filter(Boolean).map((item, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-[24px] font-bold" style={{ color: item.color, textShadow: item.glow }}>{item.value}</div>
                  <div className="text-[11px] mt-1" style={{ color: '#48484a' }}>{item.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
