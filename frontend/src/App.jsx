import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Matches from './pages/Matches'
import Players from './pages/Players'
import Batting from './pages/Batting'
import Bowling from './pages/Bowling'
import Strategy from './pages/Strategy'
import Venues from './pages/Venues'
import Teams from './pages/Teams'
import Predict from './pages/Predict'
import Records from './pages/Records'
import HeadToHead from './pages/HeadToHead'
import PlayerCompare from './pages/PlayerCompare'
import TeamDepth from './pages/TeamDepth'
import Awards from './pages/Awards'
import Settings from './pages/Settings'
import AIPredictions from './pages/AIPredictions'
import AIChat from './components/AIChat'

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Overview />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/players" element={<Players />} />
          <Route path="/batting" element={<Batting />} />
          <Route path="/bowling" element={<Bowling />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/records" element={<Records />} />
          <Route path="/head-to-head" element={<HeadToHead />} />
          <Route path="/compare" element={<PlayerCompare />} />
          <Route path="/team-depth" element={<TeamDepth />} />
                <Route path="/ai-predictions" element={<AIPredictions />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: '#000000' }}>
        <Sidebar />

        {/* Background ambient orbs — vivid */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[15%] w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(10,132,255,0.12) 0%, transparent 65%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-[-5%] right-[5%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(191,90,242,0.10) 0%, transparent 65%)', filter: 'blur(40px)' }} />
          <div className="absolute top-[35%] right-[25%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(48,209,88,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
          <div className="absolute top-[60%] left-[5%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,159,10,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        </div>

        <main
          className="flex-1 min-h-screen relative z-10"
          style={{ marginLeft: 220, transition: 'margin-left 0.35s cubic-bezier(0.25,0.46,0.45,0.94)' }}
        >
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            <AnimatedRoutes />
          </div>
        </main>
        <AIChat />
      </div>
    </BrowserRouter>
  )
}
