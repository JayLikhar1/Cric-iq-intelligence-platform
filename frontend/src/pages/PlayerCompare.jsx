import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, Search, X } from 'lucide-react'
import { advancedAPI, playersAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'
import GlassCard from '../components/GlassCard'
import StatNumber from '../components/StatNumber'
import { useFetch as useF } from '../hooks/useFetch'

export default function PlayerCompare() {
  const { data: leaderboard } = useFetch(playersAPI.getLeaderboard)
  const { data: boundary } = useFetch(advancedAPI.getBoundaryStats)
  const { data: clutch } = useFetch(advancedAPI.getClutch)

  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search1, setSearch1] = useState('')
  const [search2, setSearch2] = useState('')

  const allPlayers = leaderboard?.map(p => p.player) || []
  const filtered1 = search1 ? allPlayers.filter(p => p.toLowerCase().includes(search1.toLowerCase())) : []
  const filtered2 = search2 ? allPlayers.filter(p => p.toLowerCase().includes(search2.toLowerCase())) : []

  const compare = async () => {
    if (!p1 || !p2) return
    setLoading(true)
    try { const r = await advancedAPI.comparePlayers(p1, p2); setResult(r.data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const metricColor = (winner, player) => winner === player ? '#30d158' : '#ff453a'

  return (
    <div>
      <PageHeader title="Player Compare" subtitle="Side-by-side stats · Boundary analysis · Clutch performance" icon={GitCompare} accent="#30d158" />

      {/* Player Selector */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Player 1', val: p1, setVal: setP1, search: search1, setSearch: setSearch1, filtered: filtered1, color: '#0a84ff' },
          { label: 'Player 2', val: p2, setVal: setP2, search: search2, setSearch: setSearch2, filtered: filtered2, color: '#30d158' },
        ].map(({ label, val, setVal, search, setSearch, filtered, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(28,28,30,0.8)', border: `1px solid ${val ? color + '30' : 'rgba(255,255,255,0.07)'}` }}>
            <div className="text-[11px] uppercase tracking-widest mb-2 font-semibold" style={{ color: val ? color : '#48484a' }}>{label}</div>
            {val ? (
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-white">{val}</span>
                <button onClick={() => { setVal(''); setSearch('') }}>
                  <X size={14} color="#636366" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#48484a' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search player..."
                  className="w-full rounded-xl pl-8 pr-3 py-2 text-[13px] text-white outline-none"
                  style={{ background: 'rgba(44,44,46,0.8)', border: '1px solid rgba(255,255,255,0.08)' }} />
                {filtered.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                    style={{ background: 'rgba(28,28,30,0.98)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: 200, overflowY: 'auto' }}>
                    {filtered.slice(0, 8).map(p => (
                      <button key={p} onClick={() => { setVal(p); setSearch('') }}
                        className="w-full text-left px-3 py-2 text-[13px] text-white hover:bg-white/5 transition-all">
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        onClick={compare} disabled={!p1 || !p2 || loading}
        className="w-full py-3 rounded-xl text-white text-[14px] font-semibold mb-6 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #0a84ff, #30d158)', boxShadow: '0 4px 20px rgba(10,132,255,0.2)' }}>
        {loading ? 'Comparing...' : '⚡  Compare Players'}
      </motion.button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>

            {/* Winner Banner */}
            <div className="rounded-2xl p-5 mb-5 text-center relative overflow-hidden"
              style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)' }}>
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(48,209,88,0.5), transparent)' }} />
              <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: '#30d158' }}>Overall Better Player</div>
              <div className="text-[24px] font-bold text-white" style={{ textShadow: '0 0 20px rgba(48,209,88,0.4)' }}>{result.overall_better}</div>
              <div className="text-[12px] mt-1" style={{ color: '#636366' }}>
                {result.p1_wins} vs {result.p2_wins} metrics won
              </div>
            </div>

            <AIInsightCard insight={result.insight} title="Comparison Intelligence" />

            {/* Metric Comparison */}
            <div className="mt-5 rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="grid grid-cols-3 px-5 py-3 text-[11px] uppercase tracking-widest font-semibold"
                style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', color: '#48484a' }}>
                <div style={{ color: '#0a84ff' }}>{result.player1}</div>
                <div className="text-center">Metric</div>
                <div className="text-right" style={{ color: '#30d158' }}>{result.player2}</div>
              </div>
              {result.comparisons?.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-3 px-5 py-3.5 items-center"
                  style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-[15px] font-bold" style={{ color: metricColor(c.winner, result.player1) }}>
                    {c.p1_value || '—'}
                    {c.winner === result.player1 && <span className="text-[10px] ml-1">✓</span>}
                  </div>
                  <div className="text-center text-[12px]" style={{ color: '#636366' }}>{c.metric}</div>
                  <div className="text-[15px] font-bold text-right" style={{ color: metricColor(c.winner, result.player2) }}>
                    {c.winner === result.player2 && <span className="text-[10px] mr-1">✓</span>}
                    {c.p2_value || '—'}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boundary Stats */}
      <div className="mt-10">
        <h2 className="text-[17px] font-bold text-white mb-1">Boundary Analysis</h2>
        <p className="text-[12px] mb-5" style={{ color: '#636366' }}>What % of runs came from boundaries vs running</p>
        <div className="space-y-2">
          {boundary?.slice(0, 12).map((b, i) => (
            <motion.div key={b.player} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="px-4 py-3.5 rounded-xl" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[13px] font-semibold text-white">{b.player}</span>
                  <span className="text-[11px] ml-2" style={{ color: '#636366' }}>{b.team}</span>
                </div>
                <div className="flex items-center gap-3 text-[12px]">
                  <span style={{ color: '#0a84ff' }}>{b.fours} × 4s</span>
                  <span style={{ color: '#bf5af2' }}>{b.sixes} × 6s</span>
                  <span className="font-bold" style={{ color: '#ffd60a' }}>{b.boundary_pct}%</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${b.boundary_pct}%` }}
                  transition={{ delay: 0.3 + i * 0.03, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, #0a84ff, #bf5af2)` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Clutch Performance */}
      <div className="mt-10">
        <h2 className="text-[17px] font-bold text-white mb-1">Clutch Performance</h2>
        <p className="text-[12px] mb-5" style={{ color: '#636366' }}>Knockout stage vs group stage average comparison</p>
        <div className="space-y-2">
          {clutch?.filter(c => c.knockout_runs > 0 || c.group_runs > 0).slice(0, 10).map((c, i) => (
            <motion.div key={c.player} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl"
              style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="text-[13px] font-semibold text-white">{c.player}</div>
                <div className="text-[11px] mt-0.5" style={{
                  color: c.clutch_delta > 10 ? '#30d158' : c.clutch_delta < -10 ? '#ff453a' : '#636366'
                }}>{c.clutch_label}</div>
              </div>
              <div className="flex items-center gap-5 text-right">
                <div>
                  <div className="text-[14px] font-bold" style={{ color: '#bf5af2' }}>{c.knockout_avg}</div>
                  <div className="text-[10px]" style={{ color: '#48484a' }}>KO avg</div>
                </div>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: '#636366' }}>{c.group_avg}</div>
                  <div className="text-[10px]" style={{ color: '#48484a' }}>Group avg</div>
                </div>
                <div className="w-12 text-right">
                  <div className="text-[14px] font-bold" style={{ color: c.clutch_delta > 0 ? '#30d158' : '#ff453a' }}>
                    {c.clutch_delta > 0 ? '+' : ''}{c.clutch_delta}
                  </div>
                  <div className="text-[10px]" style={{ color: '#48484a' }}>delta</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
