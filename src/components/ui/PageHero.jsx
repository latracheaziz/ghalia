import { Scene } from '../../three/Scene'
import { Words } from './Words'

const IVORY_SILK = ['#F6ECDD', '#D9BC9A']

/** Shared page opening: a heading laid over living satin. */
export function PageHero({ eyebrow, title, intro, silk = IVORY_SILK, fallback = 'mood-silk', tone = 'dark', children }) {
  return (
    <header className="page-hero wrap" data-tone={tone} style={{ color: tone === 'light' ? '#F6EBD6' : '#44291A' }}>
      <div className="page-hero__silk"><Scene name="silk" colors={silk} fallback={fallback} /></div>
      <div className="page-hero__copy">
        {eyebrow ? <p className="eyebrow eyebrow--plain page-hero__eyebrow" data-reveal="fade">{eyebrow}</p> : null}
        <Words as="h1" className="display t-hero" text={title} />
        {intro ? <p className="t-lead measure" data-reveal="fade">{intro}</p> : null}
        {children}
      </div>
    </header>
  )
}
