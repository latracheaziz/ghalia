import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../animations/gsap'
import { useLang } from '../../state/LangContext'
import { collections } from '../../content/collections'
import { ui } from '../../content/ui'
import { isSmallScreen, prefersReducedMotion } from '../../utils/env'
import { Picture } from '../ui/Picture'
import { TextLink } from '../ui/Button'
import { TLink } from '../ui/TLink'

const INTRO_THEME = { bg: '#EBD7BE', ink: '#44291A', accent: '#6F4C18' }

const isDark = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return (n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 150
}

/**
 * Seven collections on one pinned track. The room itself changes colour with
 * each collection. Phones get a native swipe instead of a scroll hijack.
 */
export function CollectionsReel() {
  const root = useRef(null)
  const track = useRef(null)
  const { t, rtl } = useLang()
  const [horizontal] = useState(() => !isSmallScreen() && !prefersReducedMotion())

  useGSAP(() => {
    if (!horizontal) return
    const distance = () => track.current.scrollWidth - window.innerWidth
    const themes = [INTRO_THEME, ...collections.map((c) => c.theme)]
    let current = -1

    const paint = (index) => {
      if (index === current) return
      current = index
      const theme = themes[index]
      root.current.style.setProperty('--reel-bg', theme.bg)
      root.current.style.setProperty('--reel-ink', theme.ink)
      root.current.style.setProperty('--reel-accent', theme.accent)
      root.current.dataset.tone = isDark(theme.bg) ? 'light' : 'dark'
    }
    paint(0)

    gsap.to(track.current, {
      x: () => distance() * (rtl ? 1 : -1),
      ease: 'none',
      scrollTrigger: {
        trigger: root.current,
        pin: true,
        scrub: 0.6,
        start: 'top top',
        end: () => `+=${distance()}`,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => paint(Math.min(themes.length - 1, Math.round(self.progress * (themes.length - 1) + 0.15))),
      },
    })
  }, { scope: root, dependencies: [horizontal, rtl] })

  return (
    <section
      ref={root}
      id="collections"
      className={`reel ${horizontal ? 'reel--pinned' : ''}`}
      data-tone="dark"
      data-chapter={t(ui.chapters.collections)}
    >
      <div ref={track} className="reel__track">
        <div className="reel__intro">
          <p className="eyebrow eyebrow--plain">{t(ui.chapters.collections)}</p>
          <h2 className="display t-hero">{t({ en: 'Each collection tells a story.', ar: 'كل مجموعة تحكي قصة.' })}</h2>
          <TextLink to="/collections">{t(ui.collectionsAll)}</TextLink>
        </div>
        {collections.map((c, i) => (
          <article
            key={c.slug}
            className={`reel__card ${i % 2 ? 'reel__card--low' : ''}`}
            style={horizontal ? undefined : { '--reel-bg': c.theme.bg, '--reel-ink': c.theme.ink, '--reel-accent': c.theme.accent }}
          >
            <TLink to={`/collections/${c.slug}`} className="reel__link" data-cursor={t(ui.view)}>
              <div className={`arch reel__image grain`}>
                <Picture id={c.images[0]} alt={t(c.title)} sizes="(max-width: 56rem) 80vw, 34vw" />
              </div>
              <div className="reel__meta">
                <h3 className="display t-sub">{t(c.name)}</h3>
                <p>{t(c.short)}</p>
              </div>
            </TLink>
          </article>
        ))}
      </div>
    </section>
  )
}
