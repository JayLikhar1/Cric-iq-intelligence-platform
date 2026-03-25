import { motion } from 'framer-motion'
import { BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, Cell } from 'recharts'
import { useFetch } from '../hooks/useFetch'
import { playersAPI, insightsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import GlassCard from '../components/GlassCard'
import { CHART_COLORS } from '../utils/colors'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(18,18,20,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
      <div className="mb-1" style={{ color: '#636366' }}>{label || payload[0]?.payload?.player}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || '#f5f5f7' }}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  )
}

export default function Batting() {
  const { data: batters, loading } = useFetch(playersAPI.getBatting)
  const { data: phase } = useFetch(insightsAPI.getPhaseAnalysis)

  if (loading) return <LoadingSpinner text="Loading batting analytics..." />

  const top10 = batters?.slice(0, 10) || []
  const phaseTop = phase?.slice(0, 8) || []
  const phaseChart = phaseTop.map(p => ({ name: p.player.split(' ').pop(), Powerplay: p.powerplay_runs, Middle: p.middle_runs, Death: p.death_runs }))
  const srVsRuns = top10.map(b => ({ player: b.player, runs: b.runs, strike_rate: b.strike_rate }))

  return (
    <div>
      <PageHeader title="Batting Lab" subtitle="Phase-wise performance · Strike rates · Run distribution" icon={BarChart2} accent="#ff9f0a" />

      {/* Leaderboard Table */}
      <GlassCard accent="rgba(255,159,10,0.4)" hover={false} className="mb-6">
        <div className="px-5 py-4" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[15px] font-semibold text-white">Batting Leaderboard</h3>
          <p className="text-[12px] mt-0.5" style={{ color: '#636366' }}>Tournament top performers</p>
        </div>
        <div className="grid grid-cols-8 gap-2 px-5 py-2.5 text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: '#48484a', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
          {['Player', 'Team', 'M', 'Runs', 'Avg', 'SR', '4s', '6s'].map(h => <div key={h}>{h}</div>)}
        </div>
        {top10.map((b, i) => (
          <motion.div key={b.player}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid grid-cols-8 gap-2 px-5 py-3 items-center"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}
            whileHover={{ background: 'rgba(255,255,255,0.025)' }}
          >
            <div className="text-[13px] font-semibold text-white">{b.player}</div>
            <div className="text-[12px]" style={{ color: '#636366' }}>{b.team}</div>
            <div className="text-[13px] text-white">{b.matches}</div>
            <div className="text-[14px] font-bold" style={{ color: '#0a84ff', textShadow: '0 0 12px rgba(10,132,255,0.5)' }}>{b.runs}</div>
            <div className="text-[13px] text-white">{b.average}</div>
            <div className="text-[13px] font-semibold" style={{
              color: b.strike_rate >= 170 ? '#30d158' : b.strike_rate >= 140 ? '#ff9f0a' : '#8e8e93',
              textShadow: b.strike_rate >= 170 ? '0 0 10px rgba(48,209,88,0.5)' : b.strike_rate >= 140 ? '0 0 10px rgba(255,159,10,0.4)' : 'none'
            }}>{b.strike_rate}</div>
            <div className="text-[13px] text-white">{b.fours}</div>
            <div className="text-[13px] font-semibold" style={{ color: '#bf5af2', textShadow: '0 0 10px rgba(191,90,242,0.4)' }}>{b.sixes}</div>
          </motion.div>
        ))}
      </GlassCard>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GlassCard accent="rgba(10,132,255,0.4)" delay={0.2} hover={false}>
          <div className="p-5">
            <h3 className="text-[15px] font-semibold text-white mb-0.5">Phase-wise Runs</h3>
            <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Powerplay · Middle · Death</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={phaseChart} margin={{ left: -25 }} barSize={10}>
                <XAxis dataKey="name" tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="Powerplay" fill="#0a84ff" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="Middle"    fill="#bf5af2" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="Death"     fill="#30d158" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3">
              {[['Powerplay','#0a84ff'],['Middle','#bf5af2'],['Death','#30d158']].map(([l,c]) => (
                <div key={l} className="flex items-center gap-1.5 text-[11px]" style={{ color: '#636366' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />{l}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard accent="rgba(191,90,242,0.4)" delay={0.3} hover={false}>
          <div className="p-5">
            <h3 className="text-[15px] font-semibold text-white mb-0.5">Strike Rate vs Runs</h3>
            <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Aggression vs volume</p>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="runs" name="Runs" tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="strike_rate" name="SR" tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.08)' }} />
                <Scatter data={srVsRuns}>
                  {srVsRuns.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#48484a' }}>AI Batting Insights</div>
        {top10.slice(0, 4).map((b, i) => (
          <AIInsightCard key={b.player} insight={b.ai_insight} title={b.player} delay={i * 0.08} />
        ))}
      </div>
    </div>
  )
}
