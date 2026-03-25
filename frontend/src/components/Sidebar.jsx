import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Activity, User, BarChart2, Target,
  FlaskConical, MapPin, Users, TrendingUp, Settings,
  Trophy, ChevronRight, Zap, Swords, GitCompare, Shield, Star, Brain
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Analytics',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Overview', color: '#0a84ff' },
      { to: '/matches', icon: Activity, label: 'Matches', color: '#30d158' },
      { to: '/players', icon: User, label: 'Players', color: '#5e5ce6' },
      { to: '/batting', icon: BarChart2, label: 'Batting Lab', color: '#ff9f0a' },
      { to: '/bowling', icon: Target, label: 'Bowling', color: '#ff453a' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/strategy', icon: FlaskConical, label: 'Strategy Lab', color: '#bf5af2' },
      { to: '/venues', icon: MapPin, label: 'Venues', color: '#64d2ff' },
      { to: '/teams', icon: Users, label: 'Teams', color: '#30d158' },
      { to: '/predict', icon: TrendingUp, label: 'Predictions', color: '#ff9f0a' },
    ]
  },
  {
    label: 'Deep Dive',
    items: [
      { to: '/records', icon: Star, label: 'Records', color: '#ffd60a' },
      { to: '/head-to-head', icon: Swords, label: 'Head-to-Head', color: '#ff453a' },
      { to: '/compare', icon: GitCompare, label: 'Compare', color: '#30d158' },
      { to: '/team-depth', icon: Shield, label: 'Team Depth', color: '#64d2ff' },
      { to: '/ai-predictions', icon: Brain, label: 'AI Predictions', color: '#bf5af2' },
    ]
  },
  {
    label: 'More',
    items: [
      { to: '/awards', icon: Trophy, label: 'Awards', color: '#ffd60a' },
      { to: '/settings', icon: Settings, label: 'Settings', color: '#8e8e93' },
    ]
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col vibrancy"
      style={{
        borderRight: '0.5px solid rgba(255,255,255,0.08)',
        minWidth: collapsed ? 68 : 220,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)' }}
        >
          <Zap size={15} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-[15px] font-semibold text-white tracking-tight">CrikIQ</div>
              <div className="text-[10px] text-[#636366] tracking-wide uppercase">Intelligence</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden space-y-0.5">
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: '#3a3a3c' }}
                >
                  {label}
                </motion.div>
              )}
            </AnimatePresence>
            {items.map(({ to, icon: Icon, label: itemLabel, color }) => (
              <NavLink key={to} to={to} end={to === '/'}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-[10px] cursor-pointer relative overflow-hidden mb-0.5"
                    style={{ background: isActive ? `${color}18` : 'transparent' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 rounded-[10px]"
                        style={{ background: `${color}12`, border: `1px solid ${color}25` }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    )}
                    <div
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 relative z-10"
                      style={{
                        background: isActive ? `${color}28` : 'rgba(255,255,255,0.05)',
                        boxShadow: isActive ? `0 0 12px ${color}50` : 'none',
                      }}
                    >
                      <Icon size={14} strokeWidth={isActive ? 2.5 : 1.8} style={{ color: isActive ? color : '#636366' }} />
                    </div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-[13px] font-semibold relative z-10 whitespace-nowrap"
                          style={{ color: isActive ? '#ffffff' : '#8e8e93' }}
                        >
                          {itemLabel}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse */}
      <div className="p-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-[10px]"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <ChevronRight size={14} color="#636366" />
          </motion.div>
        </motion.button>
      </div>
    </motion.aside>
  )
}
