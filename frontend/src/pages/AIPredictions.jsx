import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { aiAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import StatNumber from '../components/StatNumber'

export default function AIPredictions() {
  const { data: predictions, loading: pLoad } = useFetch(aiAPI.getPredictions)
  const { data: anomalies, loading: aLoad } = useFetch(aiAPI.getAnomalies)

  if (pLoad || aLoad) return <LoadingSpinner text="Running AI models..." />

  const labelColor = (label) => {
    if (label.includes('High')) return '#30d158'
    if (label.includes('Moderate')) return '#ff9f0a'
    return '#ff453a'
  }

  return (
    <div>
      <PageHeader title="AI Predictions" subtitle="Performance forecasts · Anomaly detection · Next match projections" icon={TrendingUp} accent="#30d158" />

      {/* Anomaly Detection */}
      {anomalies?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} color="#ff9f0a" style={{ filter: 'drop-shadow(0 0 6px rgba(255,159,10,0.7))' }} />
            <h2 className="text-[17px] font-bold text-white">Anomaly Detection</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold ml-1"
              style={{ background: 'rgba(255,159,10,0.12)', color: '#ff9f0a', border: '1px solid rgba(255,159,10,0.25)' }}>
              {anomalies.length} detected
            </span>
          </div>
          <p className="text-[12px] mb-4" style={{ color: '#636366' }}>Players performing significantly above or below their tournament average</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {anomalies.map((a, i) => (
              <GlassCard key={i} delay={i * 0.06} accent={a.color + '60'}
                style={{ border: `1px solid ${a.color}25`, boxShadow: `0 0 16px ${a.color}0c` }}>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-[13px] font-bold text-white">{a.player}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#636366' }}>{a.team}</div>
                    <div className="text-[12px] mt-2 font-semibold px-2 py-0.5 rounded-full inline-block"
                      style={{ background: `${a.color}15`, color: a.color, border: `1px solid ${a.color}30` }}>
                      {a.badge}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] mb-1" style={{ color: '#48484a' }}>Actual vs Expected</div>
                    <div className="text-[18px] font-bold" style={{ color: a.color, textShadow: `0 0 14px ${a.color}60` }}>
                      {a.actual_avg}
                    </div>
                    <div className="text-[11px]" style={{ color: '#636366' }}>vs {a.expected} avg</div>
                    <div className="text-[11px] font-semibold mt-1" style={{ color: a.color }}>
                      {a.type === 'exceptional' ? `+${a.pct_above}%` : `-${a.pct_below}%`}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Performance Predictions */}
      <div className="flex items-center gap-2 mb-1">
        <Zap size={15} color="#0a84ff" style={{ filter: 'drop-shadow(0 0 6px rgba(10,132,255,0.7))' }} />
        <h2 className="text-[17px] font-bold text-white">Next Match Predictions</h2>
      </div>
      <p className="text-[12px] mb-5" style={{ color: '#636366' }}>
        Formula: (avg × 0.4) + (recent form × 0.3) + (SR × 0.3)
      </p>

      <GlassCard accent="rgba(10,132,255,0.4)" hover={false}>
        <div className="grid grid-cols-6 gap-2 px-5 py-3 text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: '#48484a', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          {['Player', 'Team', 'Predicted Range', 'Score', 'Avg', 'Verdict'].map(h => <div key={h}>{h}</div>)}
        </div>
        {predictions?.slice(0, 15).map((p, i) => (
          <motion.div key={p.player}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="grid grid-cols-6 gap-2 px-5 py-3.5 items-center"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}
            whileHover={{ background: 'rgba(255,255,255,0.025)' }}
          >
            <div className="text-[13px] font-semibold text-white">{p.player}</div>
            <div className="text-[12px]" style={{ color: '#636366' }}>{p.team}</div>
            <div className="text-[13px] font-bold" style={{ color: '#0a84ff', textShadow: '0 0 10px rgba(10,132,255,0.4)' }}>
              {p.predicted_low}–{p.predicted_high}
            </div>
            <div className="text-[13px] font-bold" style={{ color: labelColor(p.label), textShadow: `0 0 10px ${labelColor(p.label)}40` }}>
              {p.prediction_score}
            </div>
            <div className="text-[13px]" style={{ color: '#8e8e93' }}>{p.current_avg}</div>
            <div className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block"
              style={{ background: `${labelColor(p.label)}12`, color: labelColor(p.label), border: `1px solid ${labelColor(p.label)}25` }}>
              {p.label.split(' ')[0]} {p.label.split(' ')[1]}
            </div>
          </motion.div>
        ))}
      </GlassCard>
    </div>
  )
}
