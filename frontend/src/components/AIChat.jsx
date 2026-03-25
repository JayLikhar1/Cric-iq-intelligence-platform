import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, ChevronDown, Zap } from 'lucide-react'
import { aiAPI } from '../services/api'

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
        style={{ background: '#5e5ce6' }}
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
)

const QUICK = [
  "Best batsman?", "Top bowler?", "Tournament summary",
  "Predict Samson", "India strategy", "Toss impact",
]

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "👋 Hi! I'm CrikIQ AI — your cricket intelligence assistant. Ask me anything about the ICC T20 World Cup 2026.\n\nTry: *\"Best batsman?\"* or *\"Compare Bumrah and Rashid\"*",
      time: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (query) => {
    const q = (query || input).trim()
    if (!q) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q, time: new Date() }])
    setLoading(true)
    try {
      const res = await aiAPI.chat(q)
      setMessages(m => [...m, { role: 'ai', text: res.data.response, intent: res.data.intent, time: new Date() }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: '⚠️ Something went wrong. Please try again.', time: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const formatText = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*[^*]+\*)/).map((part, j) =>
          part.startsWith('*') && part.endsWith('*')
            ? <strong key={j} style={{ color: '#e5e5ea' }}>{part.slice(1, -1)}</strong>
            : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #5e5ce6, #0a84ff)',
          boxShadow: '0 0 30px rgba(94,92,230,0.5), 0 0 60px rgba(94,92,230,0.2)',
        }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 40px rgba(94,92,230,0.7), 0 0 80px rgba(94,92,230,0.3)' }}
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : { y: [0, -4, 0] }}
        transition={open ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={22} color="white" />
              </motion.div>
            : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sparkles size={22} color="white" />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Unread dot */}
      {!open && (
        <motion.div className="fixed bottom-[72px] right-6 z-50 w-3 h-3 rounded-full"
          style={{ background: '#30d158', boxShadow: '0 0 8px rgba(48,209,88,0.8)' }}
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-24 right-6 z-50 w-[380px] flex flex-col rounded-3xl overflow-hidden"
            style={{
              height: 520,
              background: 'rgba(18,18,20,0.97)',
              border: '1px solid rgba(94,92,230,0.25)',
              boxShadow: '0 0 60px rgba(94,92,230,0.2), 0 20px 60px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(40px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
              style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(94,92,230,0.08)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#5e5ce6,#0a84ff)', boxShadow: '0 0 12px rgba(94,92,230,0.5)' }}>
                  <Zap size={14} color="white" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">CrikIQ AI</div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#30d158', boxShadow: '0 0 6px rgba(48,209,88,0.8)' }} />
                    <span className="text-[10px]" style={{ color: '#30d158' }}>Online · Rule-based Intelligence</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X size={13} color="#8e8e93" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#5e5ce6,#0a84ff)', boxShadow: '0 0 8px rgba(94,92,230,0.4)' }}>
                      <Sparkles size={10} color="white" />
                    </div>
                  )}
                  <div className="max-w-[80%]">
                    <div className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                      style={msg.role === 'user'
                        ? { background: 'linear-gradient(135deg,#5e5ce6,#0a84ff)', color: 'white', borderBottomRightRadius: 6, boxShadow: '0 0 16px rgba(94,92,230,0.3)' }
                        : { background: 'rgba(44,44,46,0.8)', color: '#e5e5ea', borderBottomLeftRadius: 6, border: '1px solid rgba(255,255,255,0.07)' }
                      }>
                      {formatText(msg.text)}
                    </div>
                    <div className="text-[10px] mt-1 px-1" style={{ color: '#48484a' }}>
                      {msg.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center mr-2 mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#5e5ce6,#0a84ff)' }}>
                    <Sparkles size={10} color="white" />
                  </div>
                  <div className="rounded-2xl" style={{ background: 'rgba(44,44,46,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderBottomLeftRadius: 6 }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0"
              style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
                  style={{ background: 'rgba(94,92,230,0.1)', color: '#8e8e93', border: '1px solid rgba(94,92,230,0.2)' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(94,92,230,0.2)'; e.target.style.color = '#a78bfa' }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(94,92,230,0.1)'; e.target.style.color = '#8e8e93' }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
                style={{ background: 'rgba(44,44,46,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask about players, teams, strategy..."
                  className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder-[#48484a]"
                  style={{ caretColor: '#5e5ce6' }}
                  disabled={loading}
                />
                <motion.button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30"
                  style={{ background: input.trim() ? 'linear-gradient(135deg,#5e5ce6,#0a84ff)' : 'rgba(255,255,255,0.06)',
                    boxShadow: input.trim() ? '0 0 12px rgba(94,92,230,0.4)' : 'none' }}
                >
                  <Send size={13} color="white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
