import { gsap, ScrollTrigger, useGSAP } from './gsap'
import { prefersReducedMotion } from '../utils/env'

const ARCH_FROM = 'inset(100% 0% 0% 0%)'
const ARCH_TO = 'inset(0% 0% 0% 0%)'

/**
 * Declarative scroll choreography. Mark elements with data-reveal
 * (words | fade | arch | rule | stagger) or data-parallax="<strength>" and call
 * this once per page. Hidden states are only ever set from JS, so content stays
 * visible if scripts fail, and reduced-motion visitors get the page as authored.
 * Opacity rather than visibility, so screen readers and find-in-page reach it all.
 */
export function useReveals(scope, { delay = 0.55, dependencies = [], enabled = true } = {}) {
  useGSAP(() => {
    if (!enabled || prefersReducedMotion()) return

    const atStart = (el) => (el.getBoundingClientRect().top < window.innerHeight ? delay : 0)

    gsap.utils.toArray('[data-reveal]', scope.current).forEach((el) => {
      const kind = el.dataset.reveal
      const scrollTrigger = { trigger: el, start: 'top 90%', once: true }
      const wait = atStart(el)

      if (kind === 'words') {
        gsap.from(el.querySelectorAll('.wi'), { yPercent: 118, duration: 1.25, stagger: 0.035, delay: wait, scrollTrigger })
      } else if (kind === 'arch') {
        gsap.fromTo(el, { clipPath: ARCH_FROM }, { clipPath: ARCH_TO, duration: 1.6, ease: 'expo.inOut', delay: wait, scrollTrigger, clearProps: 'clipPath' })
        const img = el.querySelector('img')
        if (img) gsap.from(img, { scale: 1.3, duration: 2, delay: wait, scrollTrigger })
      } else if (kind === 'rule') {
        gsap.from(el, { scaleX: 0, duration: 1.5, ease: 'expo.inOut', delay: wait, scrollTrigger })
      } else if (kind === 'stagger') {
        gsap.from(el.children, { y: 34, opacity: 0, stagger: 0.09, delay: wait, scrollTrigger })
      } else {
        gsap.from(el, { y: 28, opacity: 0, duration: 1.3, delay: wait, scrollTrigger })
      }
    })

    gsap.utils.toArray('[data-parallax]', scope.current).forEach((el) => {
      const strength = Number(el.dataset.parallax) || 0.12
      gsap.fromTo(el, { yPercent: -strength * 100 }, {
        yPercent: strength * 100,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })

    ScrollTrigger.sort()
    ScrollTrigger.refresh()
  }, { scope, dependencies })
}
