import { useRef } from 'react'
import { gsap, useGSAP } from '../../animations/gsap'
import { scrollToTarget } from '../../animations/lenis'
import { useLang } from '../../state/LangContext'
import { useIntroDone } from '../../state/intro'
import { patisserie } from '../../content/pages'
import { hasFinePointer, prefersReducedMotion } from '../../utils/env'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import '../../styles/atelier.css'

/** Words only: splitting letters would break Arabic's joined script. Each word rises out of its own mask. */
function Title({ text }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <h1 className="ah__title">
      {words.map((word, i) => (
        <span key={i}>
          <span className="ah__w"><span className="ah__wi">{word}</span></span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </h1>
  )
}

/**
 * Chocolate & Patisserie opens inside the atelier: one wide photograph of the room, drawn open from the
 * side, drifting with the cursor, with the headline laid over a pale marble wash.
 */
export function AtelierHero() {
  const root = useRef(null)
  const { t, lang } = useLang()
  const introDone = useIntroDone()
  const reduced = prefersReducedMotion()
  const { atelier } = patisserie

  useGSAP(() => {
    if (reduced) return undefined
    const q = gsap.utils.selector(root)
    gsap.set(q('.ah__photo'), { clipPath: 'inset(0% 0% 0% 100%)' })
    gsap.set(q('.ah__scene'), { scale: 1.25 })
    gsap.set(q('.ah__wash'), { opacity: 0 })
    gsap.set(q('.ah__eyebrow, .ah__label, .ah__intro, .ah__actions, .ah__cue'), { opacity: 0, y: 22 })
    gsap.set(q('.ah__wi'), { yPercent: 115, rotate: 4, opacity: 0 })
    gsap.set(q('.ah__rule'), { scaleX: 0 })
    return undefined
  }, { scope: root, dependencies: [lang] })

  useGSAP(() => {
    if (reduced || !introDone) return undefined
    const q = gsap.utils.selector(root)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.to(q('.ah__photo'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.2, ease: 'power3.inOut' }, 0)
      .to(q('.ah__scene'), { scale: 1, duration: 3.4, ease: 'power3.out' }, 0)
      .to(q('.ah__wash'), { opacity: 1, duration: 1.8 }, 0.5)
      .to(q('.ah__label'), { opacity: 1, y: 0, duration: 1.1 }, 0.8)
      .to(q('.ah__rule'), { scaleX: 1, duration: 1.6, ease: 'power3.inOut' }, 0.9)
      .to(q('.ah__eyebrow'), { opacity: 1, y: 0, duration: 1.1 }, 1.0)
      .to(q('.ah__wi'), { yPercent: 0, rotate: 0, opacity: 1, duration: 1.5, stagger: 0.07 }, 1.1)
      .to(q('.ah__intro'), { opacity: 1, y: 0, duration: 1.3 }, 1.8)
      .to(q('.ah__actions'), { opacity: 1, y: 0, duration: 1.2 }, 2.0)
      .to(q('.ah__cue'), { opacity: 1, y: 0, duration: 1 }, 2.4)
    return () => tl.kill()
  }, { scope: root, dependencies: [introDone, lang] })

  // The room shifts a little against the cursor, and drifts slower than the page as it scrolls away.
  useGSAP(() => {
    if (reduced) return undefined
    const q = gsap.utils.selector(root)
    const el = root.current
    const cleanups = []
    if (hasFinePointer()) {
      const scene = q('.ah__scene')[0]
      const x = gsap.quickTo(scene, 'x', { duration: 1.6, ease: 'power3.out' })
      const y = gsap.quickTo(scene, 'y', { duration: 1.6, ease: 'power3.out' })
      const move = (e) => {
        const r = el.getBoundingClientRect()
        x((0.5 - (e.clientX - r.left) / r.width) * 40)
        y((0.5 - (e.clientY - r.top) / r.height) * 24)
      }
      el.addEventListener('pointermove', move, { passive: true })
      cleanups.push(() => el.removeEventListener('pointermove', move))
    }
    const scrub = { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.8 }
    gsap.to(q('.ah__photo'), { yPercent: 10, scale: 1.08, ease: 'none', scrollTrigger: scrub })
    gsap.to(q('.ah__copy'), { yPercent: -14, opacity: 0.15, ease: 'none', scrollTrigger: scrub })
    return () => cleanups.forEach((fn) => fn())
  }, { scope: root, dependencies: [lang] })

  const toNext = () => {
    const next = root.current?.nextElementSibling
    if (next) scrollToTarget(next, { offset: 0 })
  }

  return (
    <header ref={root} className="ah" data-tone="dark">
      <div className="ah__photo">
        <div className="ah__scene">
          <Picture id={atelier.hall.image} priority alt={t(atelier.hall.alt)} sizes="115vw" />
        </div>
      </div>
      <div className="ah__wash" aria-hidden="true" />

      <div className="ah__grid wrap">
        <div className="ah__copy">
          <p className="ah__label"><span className="ah__rule" aria-hidden="true" />{t(atelier.label)}</p>
          <p className="ah__eyebrow">{t(patisserie.title)}</p>
          <Title text={t(patisserie.headline)} />
          <p className="ah__intro">{t(patisserie.intro)}</p>
          <div className="ah__actions">
            <Button to="/order">{t(patisserie.button)}</Button>
          </div>
        </div>
      </div>

      <button type="button" className="ah__cue" onClick={toNext}>
        <span className="ah__cue-line" aria-hidden="true" />
        <span className="sr-only">{t(atelier.label)}</span>
      </button>
    </header>
  )
}
