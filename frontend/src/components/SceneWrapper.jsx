import { motion as Motion } from 'framer-motion'
import { staggerContainer } from '../data/animations'

export default function SceneWrapper({ children, className = '' }) {
  return (
    <Motion.section
      className={`relative z-20 flex min-h-screen items-center justify-center overflow-hidden px-5 pb-16 pt-40 text-center md:px-10 md:pt-44 lg:px-16 ${className}`}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.48, ease: 'easeOut' }}
    >
      {children}
    </Motion.section>
  )
}
