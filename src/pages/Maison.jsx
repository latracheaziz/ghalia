import { Page } from '../components/layout/Page'
import { MaisonHero } from '../components/maison/MaisonHero'
import { Button } from '../components/ui/Button'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { useLang } from '../state/LangContext'
import { story } from '../content/maison'
import { home } from '../content/home'

/** Our Story: the opening, the rest of the story beside a photograph, then its closing line. */
export default function Maison() {
  const { t } = useLang()
  return (
    <Page title={t(story.title)} description={t(story.paragraphs[0])}>
      <MaisonHero />

      <section className="section wrap split split--story" data-theme="paper">
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
          {story.paragraphs.slice(1).map((paragraph) => (
            <p key={paragraph.en} className="t-lead" data-reveal="fade">{t(paragraph)}</p>
          ))}
        </div>
      </section>

      <section className="section wrap closing" data-theme="mocha">
        <Words as="p" className="display t-title closing__line" text={t(story.closing)} />
        <div className="actions closing__actions" data-reveal="fade">
          <Button to="/collections">{t(home.hero.buttons.collections)}</Button>
          <Button to="/weddings" variant="ghost">{t(home.hero.buttons.events)}</Button>
        </div>
      </section>
    </Page>
  )
}
