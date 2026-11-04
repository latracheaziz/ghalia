import { useEffect, useState } from 'react'
import { ScrollTrigger } from '../../animations/gsap'
import { scrollToTarget } from '../../animations/lenis'

/** A quiet table of contents for the film, built from whatever chapters the page holds. */
export function ChapterRail() {
  const [chapters, setChapters] = useState([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-chapter]')]
    setChapters(sections.map((el) => ({ id: el.id, label: el.dataset.chapter })))
    const triggers = sections.map((el, i) => ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) => { if (self.isActive) setActive(i) },
      onLeaveBack: () => { if (i === 0) setActive(-1) },
    }))
    return () => triggers.forEach((trigger) => trigger.kill())
  }, [])

  return (
    <nav className={`rail ${active >= 0 ? 'is-on' : ''}`} aria-label="Chapters">
      <ol>
        {chapters.map((chapter, i) => (
          <li key={chapter.id}>
            <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => scrollToTarget(document.getElementById(chapter.id), { offset: 0 })}>
              <span className="rail__mark" aria-hidden="true" />
              <span className="rail__label">{chapter.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
