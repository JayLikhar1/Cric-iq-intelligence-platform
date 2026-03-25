import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { venuesAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import AIInsightCard from '../components/AIInsightCard'

const PITCH_CONFIG = {
  'Spin-friendly':    { color: '#ff9f0a', bg: 'rgba(255,159,10,0.1)',  border: 'rgba(255,159,10,0.2)' },
  'Batting paradise': { color: '#30d158', bg: 'rgba(48,209,88,0.1)',   border: 'rgba(48,209,88,0.2)' },
  'Balanced':         { color: '#0a84ff', bg: 'rgba(10,132,255,0.1)',  border: 'rgba(10,132,255,0.2)' },
  'Pace-friendly':    { color: '#bf5af2', bg: 'rgba(191,90,242,0.1)', border: 'rgba(191,90,242,0.2)' },
}

export default function Venues() {
  const { data: venues, loading } = useFetch(venuesAPI.getAll)
  const [selected, setSelected] = useState(null)

  if (loading) return <LoadingSpinner text="Loading venue intelligence..." />

  return (
    <div>
      <PageHeader title="Venue Intelligence" subtitle="Pitch behavior · Toss impact · Venue analytics" icon={MapPin} accent="#64d2ff" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {venues?.map((v, i) => {
          const pc = PITCH_CONFIG[v.pitch_type] || PITCH_CONFIG['Balanced']
          const isOpen = selected?.venue_name === v.venue_name
          return (
            <motion.div key={v.venue_name}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(isOpen ? null : v)}
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{ background: 'rgba(28,28,30,0.8)', border: `1px solid ${isOpen ? pc.border : 'rgba(255,255,255,0.07)'}` }}
              whileHover={{ borderColor: 'rgba(255,255,255,0.12)', y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[15px] font-semibold text-white">{v.venue_name}</h3>
                    <div className="text-[12px] mt-0.5" style={{ color: '#636366' }}>
                      {v.city}, {v.country} · {v.capacity?.toLocaleString()} capacity
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: pc.color, background: pc.bg, border: `1px solid ${pc.border}` }}>
                      {v.pitch_type}
                    </span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                      <ChevronDown size={14} color="#48484a" />
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Matches', value: v.total_matches, color: '#f5f5f7' },
                    { label: 'Bat First', value: v.bat_first_count, color: '#0a84ff' },
                    { label: 'Field First', value: v.field_first_count, color: '#bf5af2' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="text-[18px] font-bold" style={{ color }}>{value}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#48484a' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="p-5 space-y-3">
                      <AIInsightCard insight={v.pitch_insight} title="Pitch Intelligence" />
                      <div className="text-[12px] px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', color: '#636366' }}>
                        <span className="text-white font-medium">Stages: </span>{v.stages_hosted}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// VenueStrategy is exported separately and embedded in the Venues page via the parent
