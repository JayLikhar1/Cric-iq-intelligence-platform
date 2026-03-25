import { motion } from 'framer-motion'
import { Trophy, Users, Activity, Star, Zap, Target, TrendingUp, Award, LayoutDashboard } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { useFetch } from '../hooks/useFetch'
import { insightsAPI, matchesAPI, teamsAPI } from '../services/api'
import KPICard from '../components/KPICard'
import AIInsightCard from '../components/AIInsightCard'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import { CHART_COLORS } from '../utils/colors'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(28,28,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
      <div className="mb-1" style={{ color: '#636366' }}>{label || payload[0]?.payload?.player}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || '#f5f5f7' }}>{p.name}: <span className="font-semibold">{p.value}</span></div>)}
    </div>
  )
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
}

export default function Overview() {
  const { data: kpis, loading: kLoading } = useFetch(insightsAPI.getKPIs)
  const { data: summary } = useFetch(matchesAPI.getSummary)
  const { data: standings } = useFetch(teamsAPI.getStandings)
  const { data: toss } = useFetch(matchesAPI.getTossAnalysis)
  const { data: top } = useFetch(insightsAPI.getTopPerformers)

  if (kLoading) return <LoadingSpinner text="Loading intelligence..." />

  const groupATeams = standings?.A || []
  const tossData = toss ? [
    { name: 'Won', value: toss.toss_winner_won_match },
    { name: 'Lost', value: toss.total_matches - toss.toss_winner_won_match },
  ] : []
  const topBatters = top?.top_batters || []
  const topBowlers = top?.top_bowlers || []
  const potName = kpis?.player_of_tournament?.split(' (')[0] ?? '—'

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <motion.div variants={fadeUp}>
        <PageHeader title="Overview" subtitle="ICC Men's T20 World Cup 2026 · Complete Intelligence" icon={LayoutDashboard} accent="#0a84ff" />
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KPICard title="Matches" value={kpis?.total_matches ?? '—'} icon={Activity} color="blue" delay={0} />
        <KPICard title="Teams" value={kpis?.total_teams ?? '—'} icon={Users} color="purple" delay={0.06} />
        <KPICard title="Champion" value={kpis?.tournament_winner ?? '—'} icon={Trophy} color="gold" delay={0.12} />
        <KPICard title="Player of Tournament" value={potName} icon={Star} color="green" delay={0.18} />
        <KPICard title="Most Runs" value={kpis ? `${kpis.most_runs}` : '—'} subtitle={kpis?.most_runs_player} icon={TrendingUp} color="cyan" delay={0.24} />
        <KPICard title="Most Wickets" value={kpis ? `${kpis.most_wickets}` : '—'} subtitle={kpis?.most_wickets_player} icon={Target} color="red" delay={0.30} />
        <KPICard title="Highest Total" value="255/5" subtitle="India vs New Zealand (Final)" icon={Zap} color="amber" delay={0.36} />
        <KPICard title="Centuries" value={kpis?.centuries_scored?.toString().split(' ')[0] ?? '—'} subtitle="Most in T20 WC history" icon={Award} color="purple" delay={0.42} />
      </div>

      {/* AI Summary */}
      {summary?.ai_insight && (
        <motion.div variants={fadeUp} className="mb-8">
          <AIInsightCard insight={summary.ai_insight} title="Tournament Intelligence" />
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Top Batters Bar */}
        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Top Run Scorers</h3>
              <p className="text-[12px] mt-0.5" style={{ color: '#636366' }}>Tournament batting leaders</p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(10,132,255,0.12)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.2)' }}>Runs</span>
          </div>
          {topBatters.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topBatters} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={28}>
                <XAxis dataKey="player" tick={{ fill: '#48484a', fontSize: 10 }} tickFormatter={v => v.split(' ').pop()} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#48484a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="runs" radius={[6, 6, 0, 0]}>
                  {topBatters.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[200px] flex items-center justify-center text-[13px]" style={{ color: '#48484a' }}>Loading...</div>}
        </motion.div>

        {/* Toss Donut */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          <h3 className="text-[15px] font-semibold text-white mb-1">Toss Impact</h3>
          <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Win correlation</p>
          {tossData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={tossData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={4} strokeWidth={0}>
                    <Cell fill="#0a84ff" fillOpacity={0.9} />
                    <Cell fill="rgba(255,255,255,0.08)" />
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {[
                  { label: 'Toss → Win', value: toss?.toss_winner_won_match, color: '#0a84ff' },
                  { label: 'Toss → Loss', value: toss ? toss.total_matches - toss.toss_winner_won_match : 0, color: 'rgba(255,255,255,0.15)' },
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span style={{ color: '#8e8e93' }}>{d.label}</span>
                    </div>
                    <span className="font-semibold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
              {toss?.toss_win_percentage && (
                <div className="mt-3 text-center">
                  <span className="text-[22px] font-bold" style={{ color: '#0a84ff', textShadow: '0 0 20px rgba(10,132,255,0.7)' }}>{toss.toss_win_percentage}%</span>
                  <p className="text-[11px] mt-0.5" style={{ color: '#48484a' }}>toss winners won the match</p>
                </div>
              )}
            </>
          ) : <div className="h-[140px] flex items-center justify-center text-[13px]" style={{ color: '#48484a' }}>Loading...</div>}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Bowlers */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          <h3 className="text-[15px] font-semibold text-white mb-1">Top Wicket Takers</h3>
          <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Tournament bowling leaders</p>
          <div className="space-y-3">
            {topBowlers.length > 0 ? topBowlers.map((b, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold w-5 text-center rounded-md py-0.5" style={{ color: '#48484a', background: 'rgba(255,255,255,0.05)' }}>{i + 1}</span>
                  <div>
                    <div className="text-[13px] font-medium text-white">{b.player}</div>
                    <div className="text-[11px]" style={{ color: '#636366' }}>{b.team} · Econ {b.economy}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] font-bold" style={{ color: '#0a84ff', textShadow: '0 0 12px rgba(10,132,255,0.6)' }}>{b.wickets}</div>
                  <div className="text-[10px]" style={{ color: '#48484a' }}>wickets</div>
                </div>
              </motion.div>
            )) : <div className="text-[13px]" style={{ color: '#48484a' }}>Loading...</div>}
          </div>
        </motion.div>

        {/* Group A */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          <h3 className="text-[15px] font-semibold text-white mb-1">Group A Standings</h3>
          <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Points table · Group stage</p>
          <div className="space-y-1">
            {groupATeams.length > 0 ? groupATeams.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.06 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                style={{ background: i === 0 ? 'rgba(10,132,255,0.06)' : 'rgba(255,255,255,0.02)', border: i === 0 ? '1px solid rgba(10,132,255,0.12)' : '1px solid transparent' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold w-4" style={{ color: i < 2 ? '#0a84ff' : '#48484a' }}>{i + 1}</span>
                  <div>
                    <div className="text-[13px] font-medium text-white">{t.team}</div>
                    <div className="text-[11px]" style={{ color: '#636366' }}>{t.won}W · {t.lost}L</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px]" style={{ color: '#636366' }}>NRR {t.net_run_rate}</span>
                  <span className="text-[15px] font-bold text-white">{t.points}</span>
                  {String(t.qualified).startsWith('Yes') && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(48,209,88,0.12)', color: '#30d158', border: '1px solid rgba(48,209,88,0.2)' }}>Q</span>
                  )}
                </div>
              </motion.div>
            )) : <div className="text-[13px]" style={{ color: '#48484a' }}>Loading...</div>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
