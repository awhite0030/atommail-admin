'use client';

import { motion, useReducedMotion, useSpring, useTransform, useMotionValue, animate } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const easeOutSoft = [0.22, 1, 0.36, 1] as const;

/** Scroll-triggered rise-in with blur-free soft motion. */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay, ease: easeOutSoft }}
    >
      {children}
    </motion.div>
  )
}

/** Stagger container: children (StaggerItem) enter one after another. */
export function StaggerGroup({
  children,
  className,
  delay = 0,
  gap = 0.08,
}: {
  children: ReactNode
  className?: string
  delay?: number
  gap?: number
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  y = 18,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutSoft } },
      }}
    >
      {children}
    </motion.div>
  )
}

/** Number that counts up to its value on mount — dashboards feel alive. */
export function CountUp({
  value,
  format = (n: number) => n.toLocaleString('ru-RU'),
  className,
}: {
  value: number
  format?: (n: number) => string
  className?: string
}) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(() => (reduced ? value : 0))
  const started = useRef(false)

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }
    if (started.current) {
      // value changed after first mount (live refresh) — jump, don't re-count
      setDisplay(value)
      return
    }
    started.current = true
    const controls = animate(0, value, {
      duration: 1.1,
      ease: easeOutSoft,
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [value, reduced])

  return <span className={className}>{format(Math.round(display))}</span>
}

/** Card with a hover lift — the signature microinteraction. */
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: easeOutSoft }}
    >
      {children}
    </motion.div>
  )
}

/** Skeleton shimmer for loading tables/cards. */
export function SkeletonRows({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={className ?? 'space-y-2 p-4'} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="h-9 rounded-pill bg-ink/[0.06]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/** Page-level entrance: content rises as one soft block. */
export function PageIn({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: easeOutSoft }}
    >
      {children}
    </motion.div>
  )
}
