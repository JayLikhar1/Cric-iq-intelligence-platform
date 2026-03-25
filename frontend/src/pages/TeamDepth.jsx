import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronDown } from 'lucide-react'
import { advancedAPI, playersAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import { CHART_COLORS } from '../utils/colors'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(28,28,30,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ color: '#636366' }}>{label || payload[0]?.payload?.team}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || '#f5f5f7' }}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  )
}

export default function TeamDepth() {
  const { data: teams } = useFetch(playersAPI.getTeamsList)
  const { data: nrr } = useFetch(advancedAPI.getNRRBreakdown)
  const { data: qualPath } = useFetch(advancedAPI.getQualificationPath)

  const [selectedTeam, setSelectedTeam] = useState('India')
  const [depData, setDepData] = useState(null)
  const [varData, setVarData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async (team) => {
    setSelectedTeam(team)
    setLoading(true)
    try {
      const [dep, variety] = await Promise.all([
        advancedAPI.getDependency(team),
        advancedAPI.getBowlingVariety(team),
      ])
      setDepData(dep.data)
      setVarData(variety.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const nrrChart = nrr?.slice(0, 12).map(t => ({
    team: t.team?.split(' ').pop(),
    nrr: parseFloat(t.net_run_rate) || 0,
  })) || []

  return (
    <div>
      <PageHeader title="Team Depth" subtitle="Dependency scores · Bowling variety · Qualification paths · NRR" icon={Shield} accent="#64d2ff" />

      {/* Team Selector */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: '#48484a' }}>Select Team</div>
        <div className="flex flex-wrap gap-2">
          {(teams || []).slice(0, 12).map(t => (
            <motion.button key={t} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => load(t)}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={selectedTeam === t
                ? { background: 'rgba(100,210,255,0.15)', color: '#64d2ff', border: '1px solid rgba(100,210,255,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#8e8e93', border: '1px solid rgba(255,255,255,0.08)' }
              }>{t}</motion.button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner text="Analysing team depth..." />}

      <AnimatePresence>
        {depData && varData && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
              {/* Dependency Score */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-[15px] font-semibold text-white mb-1">Batting Dependency</h3>
                <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Reliance on top batters</p>

                {/* Donut */}
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                      <motion.circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={depData.dependency_score >= 70 ? '#ff453a' : depData.dependency_score >= 50 ? '#ff9f0a' : '#30d158'}
                        strokeWidth="3" strokeLinecap="round"
                        initial={{ strokeDasharray: '0 100' }}
                        animate={{ strokeDasharray: `${depData.dependency_score} 100` }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ filter: `drop-shadow(0 0 6px ${depData.dependency_score >= 70 ? '#ff453a' : depData.dependency_score >= 50 ? '#ff9f0a' : '#30d158'})` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[16px] font-bold text-white">{depData.dependency_score}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-white mb-2">Top 2 Batters</div>
                    {depData.top_players?.slice(0, 2).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-[12px] py-1">
                        <span style={{ color: '#8e8e93' }}>{p.player}</span>
                        <span className="font-bold" style={{ color: '#0a84ff' }}>{p.runs} runs</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4"><AIInsightCard insight={depData.insight} title="Dependency Analysis" /></div>
              </div>

              {/* Bowling Variety */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-[15px] font-semibold text-white mb-1">Bowling Variety</h3>
                <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Spin vs pace balance</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Total Bowlers', value: varData.total_bowlers, color: '#64d2ff' },
                    { label: 'Spinners', value: varData.spinners, color: '#bf5af2' },
                    { label: 'Pacers', value: varData.pacers, color: '#ff453a' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="text-[22px] font-bold" style={{ color, textShadow: `0 0 15px ${color}50` }}>{value}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#48484a' }}>{label}</div>
                    </div>
                  ))}
                </div>
                {/* Spin vs Pace bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] mb-1.5" style={{ color: '#636366' }}>
                    <span>Spin {varData.spinners}</span>
                    <span>Pace {varData.pacers}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${varData.total_bowlers > 0 ? varData.spinners / varData.total_bowlers * 100 : 50}%` }}
                      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #bf5af2, #5e5ce6)' }} />
                  </div>
                </div>
                <AIInsightCard insight={varData.insight} title="Bowling Analysis" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NRR Breakdown */}
      <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-[15px] font-semibold text-white mb-1">Net Run Rate Breakdown</h3>
        <p className="text-[12px] mb-4" style={{ color: '#636366' }}>All teams ranked by NRR</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={nrrChart} margin={{ left: -20 }} barSize={18}>
            <XAxis dataKey="team" tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="nrr" radius={[4, 4, 0, 0]}>
              {nrrChart.map((d, i) => (
                <Cell key={i} fill={d.nrr > 0 ? '#30d158' : '#ff453a'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Qualification Paths */}
      <div>
        <h2 className="text-[17px] font-bold text-white mb-1">Qualification Paths</h2>
        <p className="text-[12px] mb-5" style={{ color: '#636366' }}>Journey of every team that qualified from group stage</p>
        <div className="space-y-3">
          {qualPath?.slice(0, 8).map((team, i) => (
            <motion.div key={team.team} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-4" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[14px] font-bold text-white">{team.team}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#636366' }}>{team.wins}W · {team.losses}L · {team.points} pts</div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(48,209,88,0.1)', color: '#30d158', border: '1px solid rgba(48,209,88,0.2)' }}>
                  {team.qualified_as}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {team.journey?.map((j, k) => (
                  <div key={k} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]"
                    style={{
                      background: j.result === 'W' ? 'rgba(48,209,88,0.1)' : j.result === 'L' ? 'rgba(255,69,58,0.1)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${j.result === 'W' ? 'rgba(48,209,88,0.2)' : j.result === 'L' ? 'rgba(255,69,58,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    <span className="font-bold" style={{ color: j.result === 'W' ? '#30d158' : j.result === 'L' ? '#ff453a' : '#636366' }}>{j.result}</span>
                    <span style={{ color: '#636366' }}>vs {j.opponent}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
