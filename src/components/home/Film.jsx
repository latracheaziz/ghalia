import { useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { gsap, useGSAP } from '../../animations/gsap'
import { useLang } from '../../state/LangContext'
import { useIntroDone } from '../../state/intro'
import { brand } from '../../content/site'
import { story } from '../../content/maison'
import { ui } from '../../content/ui'
import { prefersReducedMotion } from '../../utils/env'
import { Scene } from '../../three/Scene'
import { Wordmark } from '../brand/Logo'
import { TextLink } from '../ui/Button'

// [appears, leaves] as fractions of the film's scroll length.
const BEATS = {
  beyond: [0.3, 0.44],
  line0: [0.46, 0.56],
  line1: [0.57, 0.67],
  line2: [0.68, 0.78],
  opening: [0.8, 0.98],
}

/**
 * The opening film. The stage is sticky, so it needs no pin: scrolling this tall
 * section walks the camera through the Halo Tray and into the Maison.
 */
export function Film() {
  const root = useRef(null)
  const stage = useRef(null)
  const film = useRef({ progress: 0, mouseX: 0, mouseY: 0 })
  const { t } = useLang()
  const introDone = useIntroDone()
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const move = (e) => {
      film.current.mouseX = (e.clientX / window.innerWidth) * 2 - 1
      film.current.mouseY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useGSAP(() => {
    if (reduced) return
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          film.current.progress = self.progress
          stage.current.dataset.tone = self.progress > 0.2 ? 'light' : 'dark'
        },
      },
    })

    tl.to(stage.current, { backgroundColor: '#C8975F', duration: 0.08 }, 0.14)
    tl.to(stage.current, { backgroundColor: '#21120A', duration: 0.08 }, 0.22)
    tl.to('.film__mega', { yPercent: -26, autoAlpha: 0, duration: 0.11 }, 0.01)
    tl.to('.film__foot', { y: -40, autoAlpha: 0, duration: 0.06 }, 0.01)

    Object.entries(BEATS).forEach(([key, [from, to]]) => {
      const el = `[data-beat="${key}"]`
      const fade = Math.min(0.035, (to - from) / 3)
      // Only the last beat holds a link, which must stay out of the tab order until shown.
      const alpha = key === 'opening' ? 'autoAlpha' : 'opacity'
      tl.fromTo(el, { [alpha]: 0, y: 46 }, { [alpha]: 1, y: 0, duration: fade }, from)
      if (to < 0.98) tl.to(el, { [alpha]: 0, y: -46, duration: fade }, to - fade)
    })
    tl.to({}, { duration: 0.001 }, 0.999)
  }, { scope: root, dependencies: [reduced] })

  // The hero writes itself in once the preloader starts lifting.
  useGSAP(() => {
    if (!introDone || reduced) return
    gsap.from('.film__mega', { yPercent: 16, autoAlpha: 0, duration: 2, delay: 0.35 })
    gsap.from('.film__foot > *', { y: 22, autoAlpha: 0, duration: 1.4, stagger: 0.12, delay: 0.8 })
  }, { scope: root, dependencies: [introDone, reduced] })

  return (
    <section ref={root} className={`film ${reduced ? 'film--still' : ''}`} aria-label={t(brand.tagline)}>
      <div ref={stage} className="film__stage" data-tone="dark">
        <h1 className="film__mega">
          <span className="sr-only">{t(brand.name)}: {t(brand.tagline)}</span>
          <Wordmark />
        </h1>
        <Scene name="film" film={film} fallback="gift-heritage" />
        <div className="film__foot wrap">
          <p className="film__tagline script">{t(brand.tagline)}</p>
          <p className="film__descriptor">{t(brand.descriptor)}<br />{t(brand.location)}</p>
          {reduced ? null : (
            <p className="film__hint"><span>{t(ui.scroll)}</span><ArrowDown size={16} aria-hidden="true" /></p>
          )}
        </div>
        <div className="film__beats wrap">
          <p className="film__beat display t-hero" data-beat="beyond">{t(story.beyond)}</p>
          {story.lines.map((line, i) => (
            <p key={line.en} className="film__beat display t-title" data-beat={`line${i}`}>{t(line)}</p>
          ))}
          <div className="film__beat film__beat--end" data-beat="opening">
            <p className="t-lead">{t(story.opening)}</p>
            <TextLink to="/maison">{t(ui.enter)}</TextLink>
          </div>
        </div>
      </div>
    </section>
  )
}
