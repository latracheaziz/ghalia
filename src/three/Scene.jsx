import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from '../components/layout/ErrorBoundary'
import { Picture } from '../components/ui/Picture'
import { ui } from '../content/ui'
import { useLang } from '../state/LangContext'
import { supportsWebGL } from '../utils/env'

const scenes = {
  film: lazy(() => import('./scenes/FilmScene')),
  silk: lazy(() => import('./scenes/SilkScene')),
  halo: lazy(() => import('./scenes/HaloViewer')),
  event: lazy(() => import('./scenes/EventScene')),
  box: lazy(() => import('./scenes/BoxScene')),
}

/**
 * Loads a 3D scene on demand, pauses it while off screen, and falls back to a
 * photograph if WebGL is missing or the scene fails.
 */
export function Scene({ name, fallback, fallbackAlt = '', note = false, ...props }) {
  const { t } = useLang()
  const holder = useRef(null)
  const [active, setActive] = useState(true)
  const SceneComponent = scenes[name]

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '10%' })
    observer.observe(holder.current)
    return () => observer.disconnect()
  }, [])

  const poster = fallback ? (
    <div className="scene__fallback">
      <Picture id={fallback} alt={fallbackAlt} />
      {note ? <p className="notice">{t(ui.sceneFallback)}</p> : null}
    </div>
  ) : null

  return (
    <div ref={holder} className="scene">
      {supportsWebGL() ? (
        <ErrorBoundary fallback={poster}>
          <Suspense fallback={null}>
            <SceneComponent active={active} {...props} />
          </Suspense>
        </ErrorBoundary>
      ) : poster}
    </div>
  )
}
