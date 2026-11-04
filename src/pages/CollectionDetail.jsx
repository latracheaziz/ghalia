import { useParams } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { Button } from '../components/ui/Button'
import { TLink } from '../components/ui/TLink'
import { Scene } from '../three/Scene'
import { useLang } from '../state/LangContext'
import { collections, findCollection } from '../content/collections'
import { ui } from '../content/ui'
import NotFound from './NotFound'

const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return (n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 >= 150
}

function Detail({ slug, collection }) {
  const { t } = useLang()

  const { theme, images } = collection
  const next = collections[(collections.indexOf(collection) + 1) % collections.length]
  const tone = isLight(theme.bg) ? 'dark' : 'light'
  const style = { '--bg': theme.bg, '--fg': theme.ink, '--accent': theme.accent, '--muted': theme.ink, '--line': `color-mix(in srgb, ${theme.ink} 24%, transparent)` }

  return (
    <Page title={t(collection.title)} description={t(collection.description)} nav={tone}>
      <div className="detail" style={style}>
        <header className="detail__hero wrap" data-tone={tone}>
          <div className="page-hero__silk"><Scene name="silk" colors={theme.silk} fallback={images[0]} /></div>
          <div className="detail__copy">
            <p className="eyebrow eyebrow--plain" data-reveal="fade">{t(ui.chapters.collections)}</p>
            <Words as="h1" className="display t-hero" text={t(collection.name)} />
            <p className="t-lead" data-reveal="fade">{t(collection.short)}</p>
          </div>
          <div className="arch detail__image grain" data-reveal="arch">
            <Picture id={images[0]} alt={t(collection.title)} priority sizes="(max-width: 56rem) 80vw, 38vw" />
          </div>
        </header>

        <section className="section wrap detail__story" data-tone={tone}>
          <p className="t-lead" data-reveal="fade">{t(collection.description)}</p>
          {collection.extra ? <p data-reveal="fade">{t(collection.extra)}</p> : null}
        </section>

        {images.length > 1 ? (
          <section className="wrap detail__gallery" data-tone={tone} aria-label={t(collection.title)}>
            {images.slice(1).map((id, i) => (
              <figure key={id} className={`detail__shot detail__shot--${i % 5}`}>
                <div className={`frame grain ${i % 5 === 1 ? 'arch' : ''}`} data-reveal="fade">
                  <Picture id={id} alt={t(collection.title)} sizes="(max-width: 56rem) 90vw, 40vw" />
                </div>
              </figure>
            ))}
          </section>
        ) : null}

        <section className="section wrap detail__formats" data-tone={tone}>
          <h2 className="eyebrow" data-reveal="fade">{t(ui.formatsTitle)}</h2>
          <ul className="detail__format-list">
            {collection.formats.map((format) => (
              <li key={format.id} data-reveal="fade">
                <TLink to={`/order?collection=${slug}&format=${format.id}`} className="display t-sub">{t(format.label)}</TLink>
              </li>
            ))}
          </ul>
          <div className="actions" data-reveal="fade">
            <Button to={`/order?collection=${slug}`}>{t(ui.orderThis)}</Button>
          </div>
        </section>
      </div>

      <TLink to={`/collections/${next.slug}`} className="next" data-tone={isLight(next.theme.bg) ? 'dark' : 'light'} data-cursor={t(ui.next)} style={{ '--bg': next.theme.bg, '--fg': next.theme.ink, '--accent': next.theme.accent }}>
        <span className="eyebrow eyebrow--plain">{t(ui.nextCollection)}</span>
        <span className="display t-hero">{t(next.name)}</span>
      </TLink>
    </Page>
  )
}

// Keyed by slug so moving between collections remounts the page and its choreography.
export default function CollectionDetail() {
  const { slug } = useParams()
  const collection = findCollection(slug)
  if (!collection) return <NotFound />
  return <Detail key={slug} slug={slug} collection={collection} />
}
