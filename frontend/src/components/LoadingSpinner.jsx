import { motion } from 'framer-motion'

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="relative w-12 h-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(10,132,255,0.15)', borderTopColor: '#0a84ff' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full"
          style={{ border: '1.5px solid rgba(94,92,230,0.15)', borderTopColor: '#5e5ce6' }}
        />
      </div>
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-[13px]"
        style={{ color: '#636366' }}
      >
        {text}
      </motion.span>
    </div>
  )
}
