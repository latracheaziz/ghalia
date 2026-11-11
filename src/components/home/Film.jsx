import { useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { gsap, useGSAP } from '../../animations/gsap'
import { useLang } from '../../state/LangContext'
import { useIntroDone } from '../../state/intro'
import { useTransition } from '../../state/TransitionContext'
import { brand } from '../../content/site'
import { home } from '../../content/home'
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
  const mega = useRef(null)
  const taps = useRef([])
  const { t } = useLang()
  const { go } = useTransition()
  const introDone = useIntroDone()
  const reduced = prefersReducedMotion()

  // Five clicks on the wordmark within three seconds open the admin. The 3D canvas
  // lies over the wordmark, so this listens on the stage and checks where the click landed.
  const secretDoor = (e) => {
    const el = mega.current
    // Only while the opening is on screen: once scrolled, the wordmark has gone.
    if (!el || film.current.progress > 0.04) return
    const r = el.getBoundingClientRect()
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return
    const now = performance.now()
    taps.current = [...taps.current.filter((time) => now - time < 3000), now]
    if (taps.current.length >= 5) {
      taps.current = []
      go('/admin')
    }
  }

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
        // The text eases after the scroll instead of tracking it frame for frame.
        // The camera reads self.progress (raw scroll) below, so its timing is unchanged.
        scrub: 1.2,
        onUpdate: (self) => {
          film.current.progress = self.progress
          stage.current.dataset.tone = self.progress > 0.2 ? 'light' : 'dark'
        },
      },
    })

    // Locked to the scroll, in step with the 3D camera: the room's colour, and the
    // wordmark leaving before the rising arch can reach it.
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true } })
      .to('.film__mega', { yPercent: -20, autoAlpha: 0, duration: 0.09, ease: 'sine.in' }, 0.005)
      .to('.film__foot', { y: -28, autoAlpha: 0, duration: 0.07, ease: 'sine.in' }, 0.005)
      .to(stage.current, { backgroundColor: '#C8975F', duration: 0.08 }, 0.14)
      .to(stage.current, { backgroundColor: '#21120A', duration: 0.08 }, 0.22)
      .to({}, { duration: 0.001 }, 0.999)

    Object.entries(BEATS).forEach(([key, [from, to]]) => {
      const el = `[data-beat="${key}"]`
      const fade = Math.min(0.042, (to - from) / 2.8)
      // Only the last beat holds a link, which must stay out of the tab order until shown.
      const alpha = key === 'opening' ? 'autoAlpha' : 'opacity'
      tl.fromTo(el, { [alpha]: 0, y: 28 }, { [alpha]: 1, y: 0, duration: fade, ease: 'sine.inOut' }, from)
      if (to < 0.98) tl.to(el, { [alpha]: 0, y: -28, duration: fade, ease: 'sine.inOut' }, to - fade)
    })
    tl.to({}, { duration: 0.001 }, 0.999)
  }, { scope: root, dependencies: [reduced] })

  // The hero writes itself in once the preloader starts lifting.
  useGSAP(() => {
    if (!introDone || reduced) return
    gsap.from('.film__mega', { yPercent: 12, autoAlpha: 0, duration: 2.8, delay: 0.45, ease: 'power3.out' })
    gsap.from('.film__foot > *', { y: 18, autoAlpha: 0, duration: 2, stagger: 0.2, delay: 1.1, ease: 'power3.out' })
  }, { scope: root, dependencies: [introDone, reduced] })

  return (
    <section ref={root} className={`film ${reduced ? 'film--still' : ''}`} aria-label={t(home.headline)}>
      <div ref={stage} className="film__stage" data-tone="dark" onClick={secretDoor}>
        <h1 ref={mega} className="film__mega">
          <span className="sr-only">{t(brand.name)}: {t(home.headline)}</span>
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
          <p className="film__beat display t-hero" data-beat="beyond">{t(home.headline)}</p>
          {home.memory.map((line, i) => (
            <p key={line.en} className="film__beat display t-title" data-beat={`line${i}`}>{t(line)}</p>
          ))}
          <div className="film__beat film__beat--end" data-beat="opening">
            <p className="t-lead">{t(home.born)}</p>
            <TextLink to="/maison">{t(ui.enter)}</TextLink>
          </div>
        </div>
      </div>
    </section>
  )
}
