import { useLang } from '../../state/LangContext'
import { home } from '../../content/home'
import { ui } from '../../content/ui'
import { Picture } from '../ui/Picture'
import { TLink } from '../ui/TLink'

/** Three arches for the three things people come here to do. */
export function Doors() {
  const { t } = useLang()
  return (
    <section className="section wrap doors" data-theme="ivory">
      <p className="eyebrow doors__title" data-reveal="fade">{t(home.discover.title)}</p>
      <div className="doors__row">
        {home.discover.items.map((door) => (
          <TLink key={door.to} to={door.to} className="door" data-cursor={t(ui.discover)}>
            <div className="arch door__image grain" data-reveal="arch">
              <Picture id={door.image} alt={t(door.alt)} sizes="(max-width: 56rem) 90vw, 30vw" />
            </div>
            <h3 className="display t-sub">{t(door.title)}</h3>
            <p className="muted">{t(door.text)}</p>
          </TLink>
        ))}
      </div>
    </section>
  )
}
