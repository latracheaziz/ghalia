import { useLang } from '../../state/LangContext'
import { home } from '../../content/home'
import { ui } from '../../content/ui'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { Words } from '../ui/Words'

/** The World of Ghalia: one photograph, one paragraph, one way on to the story. */
export function World() {
  const { t } = useLang()
  const { world } = home
  return (
    <section id="world" className="section wrap split split--story" data-theme="paper" data-chapter={t(ui.chapters.world)}>
      <div className="split__media">
        <div className="arch split__arch grain" data-reveal="arch">
          <Picture
            id="boutique-salon"
            alt={t({ en: 'Inside the GHALIA boutique: a marble counter of flowers and chocolate, a blush sofa and blossom overhead', ar: 'داخل متجر غالية: طاولة رخامية للورد والشوكولاتة، وكنبة وردية، وزهر معلّق' })}
            sizes="(max-width: 56rem) 90vw, 46vw"
          />
        </div>
      </div>
      <div className="split__copy">
        <p className="eyebrow" data-reveal="fade">{t(world.eyebrow)}</p>
        <Words as="h2" className="display t-title" text={t(world.headline)} />
        <p className="t-lead" data-reveal="fade">{t(world.body)}</p>
        <div data-reveal="fade"><Button to="/maison">{t(world.button)}</Button></div>
      </div>
    </section>
  )
}
