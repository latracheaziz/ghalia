import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { gsap } from '../../animations/gsap'
import { useLang } from '../../state/LangContext'
import { expertise } from '../../content/events'
import { ui } from '../../content/ui'
import { home } from '../../content/home'
import { hasFinePointer } from '../../utils/env'
import { Picture } from '../ui/Picture'
import { TLink } from '../ui/TLink'
import { Words } from '../ui/Words'

/** The eight expertises as an index. On desktop a small arch trails the cursor. */
export function Expertise() {
  const { t } = useLang()
  const floater = useRef(null)
  const [hovered, setHovered] = useState(-1)

  useEffect(() => {
    if (!hasFinePointer()) return
    const x = gsap.quickTo(floater.current, 'x', { duration: 0.6, ease: 'power3.out' })
    const y = gsap.quickTo(floater.current, 'y', { duration: 0.6, ease: 'power3.out' })
    const move = (e) => {
      x(e.clientX)
      y(e.clientY)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <section id="expertise" className="section wrap expertise" data-theme="paper" data-chapter={t(ui.chapters.expertise)}>
      <header className="expertise__head">
        <p className="eyebrow" data-reveal="fade">{t(ui.chapters.expertise)}</p>
        <Words as="h2" className="display t-title" text={t(home.subheadline)} />
      </header>
      <ul className="expertise__list" onPointerLeave={() => setHovered(-1)}>
        {expertise.map((item, i) => (
          <li key={item.name.en} data-reveal="fade">
            <TLink
              to={item.hash ? `${item.to}#${item.hash}` : item.to}
              className={`expertise__row ${hovered === i ? 'is-on' : ''}`}
              onPointerEnter={() => setHovered(i)}
            >
              <span className="expertise__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="expertise__name display">{t(item.name)}</span>
              <span className="arch expertise__thumb"><Picture id={item.image} alt="" sizes="5rem" /></span>
              <ArrowRight className="expertise__arrow flip" aria-hidden="true" />
            </TLink>
          </li>
        ))}
      </ul>
      <div ref={floater} className="expertise__floater" aria-hidden="true">
        <div className={`arch expertise__float ${hovered >= 0 ? 'is-on' : ''}`}>
          {expertise.map((item, i) => (
            <Picture key={item.name.en} id={item.image} alt="" sizes="20rem" className={i === hovered ? 'is-on' : ''} />
          ))}
        </div>
      </div>
    </section>
  )
}
