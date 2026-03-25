import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { useFetch } from '../hooks/useFetch'
import { teamsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import GlassCard from '../components/GlassCard'
import StatNumber from '../components/StatNumber'

export default function Teams() {
  const { data: standings, loading } = useFetch(teamsAPI.getStandings)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamData, setTeamData] = useState(null)
  const [radarData, setRadarData] = useState(null)
  const [loadingTeam, setLoadingTeam] = useState(false)

  const loadTeam = async (team) => {
    if (selectedTeam === team) { setSelectedTeam(null); setTeamData(null); return }
    setSelectedTeam(team)
    setLoadingTeam(true)
    try {
      const [stats, radar] = await Promise.all([teamsAPI.getStats(team), teamsAPI.getRadar(team)])
      setTeamData(stats.data)
      setRadarData(radar.data)
    } catch (e) { console.error(e) }
    finally { setLoadingTeam(false) }
  }

  if (loading) return <LoadingSpinner text="Loading team analytics..." />

  const allGroups = Object.entries(standings || {})

  return (
    <div>
      <PageHeader title="Team Analytics" subtitle="Standings · Radar charts · Squad analysis" icon={Users} accent="#30d158" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Standings */}
        <div className="lg:col-span-2 space-y-4">
          {allGroups.map(([group, teams]) => (
            <div key={group} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-3.5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-[13px] font-semibold text-white">
                  {group.startsWith('SE') ? `Super Eight · Group ${group.slice(2)}` : `Group ${group}`}
                </h3>
              </div>
              {teams.map((t, i) => (
                <motion.div key={t.team}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  onClick={() => loadTeam(t.team)}
                  className="flex items-center justify-between px-5 py-3 cursor-pointer transition-all"
                  style={{
                    borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                    background: selectedTeam === t.team ? 'rgba(10,132,255,0.06)' : 'transparent',
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold w-4" style={{ color: i < 2 ? '#0a84ff' : '#48484a' }}>{i + 1}</span>
                    <div>
                      <div className="text-[13px] font-semibold text-white">{t.team}</div>
                      <div className="text-[11px]" style={{ color: '#636366' }}>{t.won}W · {t.lost}L{t.no_result > 0 ? ` · ${t.no_result}NR` : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px]" style={{ color: '#636366' }}>NRR {t.net_run_rate}</span>
                    <span className="text-[15px] font-bold text-white w-6 text-right">{t.points}</span>
                    {String(t.qualified).startsWith('Yes') && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(48,209,88,0.12)', color: '#30d158', border: '1px solid rgba(48,209,88,0.2)' }}>✓</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Team Detail */}
        <div className="space-y-4">
          {loadingTeam && <LoadingSpinner text="Loading team..." />}

          <AnimatePresence>
            {teamData && !loadingTeam && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-4">
                {/* Radar */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 className="text-[15px] font-bold text-white mb-0.5">{selectedTeam}</h3>
                  <p className="text-[12px] mb-4" style={{ color: '#636366' }}>{teamData.total_wins}W from {teamData.total_matches} matches</p>
                  {radarData?.radar && (
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData.radar}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#48484a', fontSize: 10 }} />
                        <Radar dataKey="value" stroke="#0a84ff" fill="#0a84ff" fillOpacity={0.15} strokeWidth={1.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <AIInsightCard insight={teamData.ai_insight} title="Team Intelligence" />

                {/* Squad */}
                <div className="rounded-2xl p-4" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h4 className="text-[11px] uppercase tracking-widest mb-3 font-semibold" style={{ color: '#48484a' }}>Squad</h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {teamData.squad?.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-[12px] py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <span className="text-white">{p.player_name}</span>
                        <span style={{ color: '#48484a' }}>{p.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedTeam && !loadingTeam && (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(28,28,30,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Users size={28} color="#2c2c2e" className="mx-auto mb-3" />
              <p className="text-[13px]" style={{ color: '#48484a' }}>Select a team to view analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
