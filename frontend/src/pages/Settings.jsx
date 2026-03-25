import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Database, Sliders, RefreshCw, Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
    <div className="flex-1 pr-4">
      <div className="text-[13px] font-semibold text-white">{label}</div>
      {desc && <div className="text-[11px] mt-0.5" style={{ color: '#636366' }}>{desc}</div>}
    </div>
    <motion.button onClick={() => onChange(!value)}
      className="relative w-12 h-7 rounded-full flex-shrink-0"
      style={{ boxShadow: value ? '0 0 12px rgba(10,132,255,0.4)' : 'none' }}
      animate={{ background: value ? '#0a84ff' : 'rgba(255,255,255,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <motion.div animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
    </motion.button>
  </div>
)

export default function SettingsPage() {
  const [features, setFeatures] = useState({
    aiInsights: true, winProbability: true, phaseAnalysis: true, strategyLab: true, monteCarlo: true,
  })
  const [saved, setSaved] = useState(false)
  const toggle = (key) => setFeatures(f => ({ ...f, [key]: !f[key] }))

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure features, model parameters and data controls" icon={Settings} accent="#8e8e93" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Profile */}
        <GlassCard accent="rgba(10,132,255,0.4)" hover={false}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <User size={14} color="#0a84ff" style={{ filter: 'drop-shadow(0 0 6px rgba(10,132,255,0.6))' }} />
              <h3 className="text-[13px] font-semibold text-white">User Profile</h3>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[22px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#0a84ff,#5e5ce6)', boxShadow: '0 0 20px rgba(10,132,255,0.35)' }}>A</div>
              <div>
                <div className="text-[16px] font-semibold text-white">Analyst</div>
                <div className="text-[12px] mt-0.5" style={{ color: '#636366' }}>analyst@crikiq.com</div>
                <span className="text-[11px] px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold"
                  style={{ background: 'rgba(10,132,255,0.12)', color: '#0a84ff', border: '1px solid rgba(10,132,255,0.25)', boxShadow: '0 0 8px rgba(10,132,255,0.2)' }}>Admin</span>
              </div>
            </div>
            {[['Saved Insights','12'],['Reports Generated','5'],['Last Login','Today']].map(([k,v]) => (
              <div key={k} className="flex items-center justify-between py-2.5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[13px]" style={{ color: '#636366' }}>{k}</span>
                <span className="text-[13px] font-semibold text-white">{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Feature Toggles */}
        <GlassCard accent="rgba(191,90,242,0.4)" hover={false}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Sliders size={14} color="#bf5af2" style={{ filter: 'drop-shadow(0 0 6px rgba(191,90,242,0.6))' }} />
              <h3 className="text-[13px] font-semibold text-white">Feature Toggles</h3>
            </div>
            <Toggle label="AI Insights Engine"     desc="Natural language insights on every dashboard" value={features.aiInsights}      onChange={() => toggle('aiInsights')} />
            <Toggle label="Win Probability"        desc="Live win probability calculations"            value={features.winProbability}   onChange={() => toggle('winProbability')} />
            <Toggle label="Phase Analysis"         desc="Powerplay, middle and death over breakdowns"  value={features.phaseAnalysis}    onChange={() => toggle('phaseAnalysis')} />
            <Toggle label="Strategy Lab"           desc="AI-powered team selection and bowling plans"  value={features.strategyLab}      onChange={() => toggle('strategyLab')} />
            <Toggle label="Monte Carlo Simulation" desc="Tournament outcome probability simulation"    value={features.monteCarlo}       onChange={() => toggle('monteCarlo')} />
          </div>
        </GlassCard>

        {/* Model Parameters */}
        <GlassCard accent="rgba(48,209,88,0.4)" hover={false}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Sliders size={14} color="#30d158" style={{ filter: 'drop-shadow(0 0 6px rgba(48,209,88,0.6))' }} />
              <h3 className="text-[13px] font-semibold text-white">Model Parameters</h3>
            </div>
            {[
              { label: 'Simulation Runs',    value: 2000, min: 100, max: 10000, color: '#0a84ff' },
              { label: 'Batting Weight',     value: 60,   min: 0,   max: 100,   color: '#30d158' },
              { label: 'Bowling Weight',     value: 40,   min: 0,   max: 100,   color: '#bf5af2' },
            ].map(({ label, value, min, max, color }) => (
              <div key={label} className="mb-5">
                <div className="flex justify-between text-[12px] mb-2">
                  <span style={{ color: '#8e8e93' }}>{label}</span>
                  <span className="font-bold" style={{ color, textShadow: `0 0 10px ${color}50` }}>{value}</span>
                </div>
                <div className="relative h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${(value-min)/(max-min)*100}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Data Controls */}
        <GlassCard accent="rgba(255,159,10,0.4)" hover={false}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Database size={14} color="#ff9f0a" style={{ filter: 'drop-shadow(0 0 6px rgba(255,159,10,0.6))' }} />
              <h3 className="text-[13px] font-semibold text-white">Data Controls</h3>
            </div>
            <div className="space-y-2 mb-5">
              {[
                { label: 'Refresh Match Data',   color: '#0a84ff' },
                { label: 'Refresh Player Stats', color: '#bf5af2' },
                { label: 'Clear Cache',          color: '#ff9f0a' },
              ].map(({ label, color }) => (
                <motion.button key={label} whileHover={{ scale: 1.01, x: 2 }} whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <RefreshCw size={13} style={{ color, filter: `drop-shadow(0 0 4px ${color}80)` }} />
                  {label}
                </motion.button>
              ))}
            </div>
            <div className="rounded-xl p-3 mb-4"
              style={{ background: 'rgba(48,209,88,0.07)', border: '1px solid rgba(48,209,88,0.15)', boxShadow: '0 0 12px rgba(48,209,88,0.06)' }}>
              <div className="text-[12px] font-semibold" style={{ color: '#30d158', textShadow: '0 0 10px rgba(48,209,88,0.5)' }}>● Data Status: Live</div>
              <div className="text-[11px] mt-0.5" style={{ color: '#48484a' }}>All datasets loaded · Last updated: Today</div>
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl text-white text-[13px] font-semibold flex items-center justify-center gap-2"
              style={{
                background: saved ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${saved ? 'rgba(48,209,88,0.35)' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: saved ? '0 0 16px rgba(48,209,88,0.2)' : 'none',
              }}>
              {saved ? <><Check size={14} color="#30d158" /> Saved</> : 'Save Settings'}
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
