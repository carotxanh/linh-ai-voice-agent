import { motion as Motion } from 'framer-motion'
import { fadeUp } from '../data/animations'

export default function GlassCard({ children, className = '', delay = 0 }) {
  return (
    <Motion.div
      variants={fadeUp}
      transition={{ duration: 0.42, delay, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.015 }}
      className={`glass-card-cinema ${className}`}
    >
      {children}
    </Motion.div>
  )
}
