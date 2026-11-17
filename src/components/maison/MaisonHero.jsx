import { useRef } from 'react'
import { gsap, useGSAP } from '../../animations/gsap'
import { scrollToTarget } from '../../animations/lenis'
import { useLang } from '../../state/LangContext'
import { useIntroDone } from '../../state/intro'
import { story } from '../../content/maison'
import { ui } from '../../content/ui'
import { hasFinePointer, prefersReducedMotion } from '../../utils/env'
import { Scene } from '../../three/Scene'
import { Rosette } from '../brand/Logo'
import { Picture } from '../ui/Picture'
import '../../styles/maison-hero.css'

// The arch, drawn as an open line so it can be traced on. pathLength is normalised to 1.
const ARCH = 'M6 554V206A194 194 0 0 1 394 206V554'

/** Words only: splitting letters would break Arabic's joined script. Each word rises out of its own mask. */
function Title({ text }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <h1 className="mh__title">
      {words.map((word, i) => (
        <span key={i}>
          <span className="mh__w"><span className="mh__wi">{word}</span></span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </h1>
  )
}

/**
 * The Our Story opening, built around the first chapter: flour drifting like snow, sugar turning to gold.
 * A dark room of drifting dust, a gold arch window onto the craft, and the four chapters as a timeline.
 */
export function MaisonHero() {
  const root = useRef(null)
  const { t, lang } = useLang()
  const introDone = useIntroDone()
  const reduced = prefersReducedMotion()

  // Starting poses are set before the first paint; the entrance plays once the preloader lifts.
  useGSAP(() => {
    if (reduced) return undefined
    const q = gsap.utils.selector(root)
    gsap.set(q('.mh__glow'), { opacity: 0, scale: 0.85 })
    gsap.set(q('.mh__line path'), { strokeDashoffset: 1 })
    gsap.set(q('.mh__window'), { clipPath: 'inset(100% 0% 0% 0%)' })
    gsap.set(q('.mh__window img'), { scale: 1.35 })
    gsap.set(q('.mh__rosette'), { opacity: 0, rotate: -40 })
    gsap.set(q('.mh__eyebrow, .mh__quote'), { opacity: 0, y: 24 })
    gsap.set(q('.mh__wi'), { yPercent: 115, rotate: 4, opacity: 0 })
    gsap.set(q('.mh__cue'), { opacity: 0 })
    return undefined
  }, { scope: root, dependencies: [lang] })

  useGSAP(() => {
    if (reduced || !introDone) return undefined
    const q = gsap.utils.selector(root)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.to(q('.mh__glow'), { opacity: 1, scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
      .to(q('.mh__line path'), { strokeDashoffset: 0, duration: 2.4, stagger: 0.25, ease: 'power3.inOut' }, 0.1)
      .to(q('.mh__window'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.9, ease: 'expo.inOut' }, 0.5)
      .to(q('.mh__window img'), { scale: 1, duration: 3, ease: 'power3.out' }, 0.5)
      .to(q('.mh__rosette'), { opacity: 0.5, rotate: 0, duration: 2.8, ease: 'power3.out' }, 0.7)
      .to(q('.mh__eyebrow'), { opacity: 1, y: 0, duration: 1.2 }, 0.7)
      .to(q('.mh__wi'), { yPercent: 0, rotate: 0, opacity: 1, duration: 1.5, stagger: 0.07 }, 0.85)
      .to(q('.mh__quote'), { opacity: 1, y: 0, duration: 1.4 }, 1.6)
      .to(q('.mh__cue'), { opacity: 1, duration: 1 }, 2.4)
    return () => tl.kill()
  }, { scope: root, dependencies: [introDone, lang] })

  // Pointer parallax (layers move at different depths) and scroll parallax (the room pulls away).
  useGSAP(() => {
    if (reduced) return undefined
    const q = gsap.utils.selector(root)
    const cleanups = []

    if (hasFinePointer()) {
      const layers = [
        ['.mh__rosette', 26], ['.mh__line', 14], ['.mh__window', -9], ['.mh__title', 7], ['.mh__glow', 18],
      ].map(([sel, depth]) => {
        const el = q(sel)[0]
        return el ? { depth, x: gsap.quickTo(el, 'x', { duration: 1.4, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: 1.4, ease: 'power3.out' }) } : null
      }).filter(Boolean)
      const move = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        layers.forEach((l) => { l.x(nx * l.depth * 2); l.y(ny * l.depth * 2) })
      }
      window.addEventListener('pointermove', move, { passive: true })
      cleanups.push(() => window.removeEventListener('pointermove', move))
    }

    const scrub = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 }
    gsap.to(q('.mh__window img'), { scale: 1.18, yPercent: 7, ease: 'none', scrollTrigger: scrub })
    gsap.to(q('.mh__stage'), { yPercent: -7, ease: 'none', scrollTrigger: scrub })
    gsap.to(q('.mh__copy'), { yPercent: -12, opacity: 0.25, ease: 'none', scrollTrigger: scrub })
    gsap.to(q('.mh__rosette'), { rotate: 70, ease: 'none', scrollTrigger: scrub })
    return () => cleanups.forEach((fn) => fn())
  }, { scope: root, dependencies: [lang] })

  const toStory = () => {
    const next = root.current?.nextElementSibling
    if (next) scrollToTarget(next, { offset: 0 })
  }

  return (
    <header ref={root} className="mh" data-tone="light">
      <div className="mh__bg" aria-hidden="true">
        <div className="mh__glow" />
      </div>
      <div className="mh__dust" aria-hidden="true"><Scene name="flour" /></div>

      <div className="mh__grid wrap">
        <div className="mh__copy">
          <p className="mh__eyebrow">{t(story.title)}</p>
          <Title text={t(story.headline)} />
          <p className="mh__quote">{t(story.paragraphs[0])}</p>
        </div>

        <div className="mh__stage">
          <Rosette className="mh__rosette" />
          <svg className="mh__line" viewBox="0 0 400 560" fill="none" aria-hidden="true" preserveAspectRatio="none">
            <path d={ARCH} pathLength="1" strokeDasharray="1" />
            <path d={ARCH} pathLength="1" strokeDasharray="1" transform="translate(18 -14)" opacity="0.4" />
          </svg>
          <div className="mh__window arch grain">
            <Picture
              id="mood-craft"
              priority
              alt={t({ en: 'A gold nozzle finishing chocolates by hand', ar: 'نقش ذهبي على الشوكولاتة باليد' })}
              sizes="(max-width: 56rem) 70vw, 36vw"
            />
          </div>
        </div>
      </div>

      <button type="button" className="mh__cue" onClick={toStory}>
        <span className="mh__cue-label">{t(ui.discover)}</span>
        <span className="mh__cue-line" aria-hidden="true" />
      </button>
    </header>
  )
}
