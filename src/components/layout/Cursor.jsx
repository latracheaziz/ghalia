import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../animations/gsap'
import { hasFinePointer, prefersReducedMotion } from '../../utils/env'

const INTERACTIVE = 'a, button, label, select, input, textarea, [role="radio"]'

export function Cursor() {
  const root = useRef(null)
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion())
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!enabled) return
    const el = root.current
    const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })

    const move = (e) => {
      x(e.clientX)
      y(e.clientY)
      el.classList.remove('is-hidden')
    }
    const over = (e) => {
      const labelled = e.target.closest?.('[data-cursor]')
      const text = labelled?.dataset.cursor ?? ''
      setLabel(text)
      el.classList.toggle('is-label', Boolean(text))
      el.classList.toggle('is-link', !text && Boolean(e.target.closest?.(INTERACTIVE)))
    }
    const leave = () => el.classList.add('is-hidden')

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={root} className="cursor is-hidden" aria-hidden="true">
      <div className="cursor__ring">{label}</div>
    </div>
  )
}
