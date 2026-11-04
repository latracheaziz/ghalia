import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from '../utils/env'

let lenis = null

/** Starts smooth scrolling and drives it from GSAP's ticker so both share one clock. */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {}
  lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export const pauseScroll = () => lenis?.stop()
export const resumeScroll = () => lenis?.start()

export function scrollToTarget(target, options = {}) {
  if (lenis) return lenis.scrollTo(target, { offset: -80, duration: 1.4, ...options })
  const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top: y, behavior: options.immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function jumpToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}
