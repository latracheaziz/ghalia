import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'
import { hasFinePointer, prefersReducedMotion } from '../utils/env'

export function useMagnetic(strength = 0.28) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - r.left - r.width / 2) * strength)
      y((e.clientY - r.top - r.height / 2) * strength)
    }
    const leave = () => { x(0); y(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])

  return ref
}
