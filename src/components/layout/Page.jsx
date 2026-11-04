import { useEffect, useRef } from 'react'
import { useTransition } from '../../state/TransitionContext'
import { useLang } from '../../state/LangContext'
import { useIntroDone } from '../../state/intro'
import { useReveals } from '../../animations/useReveals'

/** Page shell: sets the title, runs scroll choreography and lifts the curtain. */
export function Page({ title, description, children, className = '', nav = 'dark' }) {
  const ref = useRef(null)
  const { pageReady } = useTransition()
  const { lang } = useLang()
  const introDone = useIntroDone()

  useEffect(() => {
    document.title = title ? `${title} | GHALIA` : 'GHALIA'
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.documentElement.dataset.nav = nav
  }, [title, description, nav])

  useEffect(() => { pageReady() }, [pageReady, lang])

  useReveals(ref, { dependencies: [introDone, lang], enabled: introDone })

  return (
    <main ref={ref} id="main" tabIndex={-1} className={className} style={{ outline: 'none' }}>
      {children}
    </main>
  )
}
