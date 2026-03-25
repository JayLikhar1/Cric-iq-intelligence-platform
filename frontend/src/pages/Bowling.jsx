import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useFetch } from '../hooks/useFetch'
import { playersAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import GlassCard from '../components/GlassCard'
import { CHART_COLORS } from '../utils/colors'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(18,18,20,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
      <div className="mb-1" style={{ color: '#636366' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || '#f5f5f7' }}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  )
}

export default function Bowling() {
  const { data: bowlers, loading } = useFetch(playersAPI.getBowling)

  if (loading) return <LoadingSpinner text="Loading bowling intelligence..." />

  const top10 = bowlers?.slice(0, 10) || []
  const econChart = top10.map(b => ({ name: b.player.split(' ').pop(), economy: b.economy }))
  const wktChart  = top10.map(b => ({ name: b.player.split(' ').pop(), wickets: b.wickets }))

  return (
    <div>
      <PageHeader title="Bowling Intelligence" subtitle="Economy trends · Wicket distribution · Phase effectiveness" icon={Target} accent="#ff453a" />

      <GlassCard accent="rgba(255,69,58,0.4)" hover={false} className="mb-6">
        <div className="px-5 py-4" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[15px] font-semibold text-white">Bowling Leaderboard</h3>
          <p className="text-[12px] mt-0.5" style={{ color: '#636366' }}>Tournament top wicket takers</p>
        </div>
        <div className="grid grid-cols-8 gap-2 px-5 py-2.5 text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: '#48484a', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
          {['Player','Team','M','Wkts','Avg','Econ','Best','5W'].map(h => <div key={h}>{h}</div>)}
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
            <div className="text-[14px] font-bold" style={{ color: '#bf5af2', textShadow: '0 0 12px rgba(191,90,242,0.5)' }}>{b.wickets}</div>
            <div className="text-[13px] text-white">{b.average}</div>
            <div className="text-[13px] font-semibold" style={{
              color: b.economy <= 7 ? '#30d158' : b.economy <= 8.5 ? '#ff9f0a' : '#ff453a',
              textShadow: b.economy <= 7 ? '0 0 10px rgba(48,209,88,0.5)' : b.economy <= 8.5 ? '0 0 10px rgba(255,159,10,0.4)' : '0 0 10px rgba(255,69,58,0.4)'
            }}>{b.economy}</div>
            <div className="text-[12px]" style={{ color: '#636366' }}>{b.best_figures}</div>
            <div className="text-[13px] font-semibold" style={{ color: '#ffd60a', textShadow: '0 0 10px rgba(255,214,10,0.4)' }}>{b.five_wicket_hauls || 0}</div>
          </motion.div>
        ))}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GlassCard accent="rgba(48,209,88,0.4)" delay={0.2} hover={false}>
          <div className="p-5">
            <h3 className="text-[15px] font-semibold text-white mb-0.5">Economy Rate</h3>
            <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Lower is better</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={econChart} layout="vertical" margin={{ left: 10, right: 10 }} barSize={14}>
                <XAxis type="number" tick={{ fill: '#48484a', fontSize: 10 }} domain={[0, 12]} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#8e8e93', fontSize: 11 }} width={65} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="economy" radius={[0, 6, 6, 0]}>
                  {econChart.map((d, i) => (
                    <Cell key={i} fill={d.economy <= 7 ? '#30d158' : d.economy <= 8.5 ? '#ff9f0a' : '#ff453a'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard accent="rgba(191,90,242,0.4)" delay={0.3} hover={false}>
          <div className="p-5">
            <h3 className="text-[15px] font-semibold text-white mb-0.5">Wicket Distribution</h3>
            <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Total wickets taken</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={wktChart} margin={{ left: -25 }} barSize={22}>
                <XAxis dataKey="name" tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="wickets" radius={[6, 6, 0, 0]}>
                  {wktChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#48484a' }}>AI Bowling Insights</div>
        {top10.slice(0, 4).map((b, i) => (
          <AIInsightCard key={b.player} insight={b.ai_insight} title={b.player} delay={i * 0.08} />
        ))}
      </div>
    </div>
  )
}
