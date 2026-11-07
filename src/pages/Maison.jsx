import { Fragment, useState } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/ui/PageHero'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { useLang } from '../state/LangContext'
import { commitment, fulfil, future, mission, patisserie, pillars, promise, story, vision, world } from '../content/maison'
import { expertise } from '../content/events'
import { ui } from '../content/ui'
import { whatsappLink } from '../utils/whatsapp'
import { SocialIcon } from '../components/brand/SocialIcon'

const COPY = {
  page: { en: 'Our Story and the Patisserie', ar: 'قصتنا والحلا والحلويات' },
  description: { en: 'Ghalia Chocolate and Patisserie', ar: 'غالية للشوكولاتة والحلا والحلويات' },
  vision: { en: 'Our Vision', ar: 'رؤيتنا' },
  mission: { en: 'Our Mission', ar: 'رسالتنا' },
  fulfil: { en: 'How we fulfill our mission', ar: 'كيف نحقق رسالتنا' },
  commitment: { en: 'Our commitment', ar: 'التزامنا' },
  world: { en: 'Our World', ar: 'عالمنا' },
  essence: { en: 'The Essence', ar: 'الجوهر' },
  experience: { en: 'The Experience', ar: 'التجربة' },
  future: { en: 'Future Growth Strategy', ar: 'استراتيجية النمو المستقبلية' },
  priorities: { en: 'Strategic Priorities', ar: 'الأولويات الاستراتيجية' },
}

const COLLAGE = [
  ['mood-craft', 'A gold nozzle finishing chocolates by hand', 'نقش ذهبي على الشوكولاتة باليد'],
  ['mood-maison', 'The Maison boutique interior', 'المتجر من الداخل'],
  ['mood-arch', 'A flowered arch set for a celebration', 'قوس مزهر مجهز لمناسبة'],
  ['mood-rose-box', 'A blush velvet box of chocolates and a gift bag', 'علبة مخملية وردية وحقيبة هدايا'],
  ['mood-pralines', 'Chocolates finished with gold details', 'شوكولاتة بتفاصيل ذهبية'],
]

/** The five pillars: one opens at a time, on hover, focus or tap. */
function Pillars() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <ul className="pillars">
      {pillars.map((pillar, i) => (
        <li key={pillar.title.en} className={i === open ? 'is-open' : ''} data-reveal="fade">
          <button type="button" aria-expanded={i === open} onClick={() => setOpen(i)} onPointerEnter={() => setOpen(i)}>
            <span className="pillars__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <span className="display t-sub">{t(pillar.title)}</span>
          </button>
          <div className="pillars__body"><p className="muted">{t(pillar.text)}</p></div>
        </li>
      ))}
    </ul>
  )
}

export default function Maison() {
  const { t } = useLang()
  return (
    <Page title={t(COPY.page)} description={t(COPY.description)}>
      <PageHero eyebrow={t(story.title)} title={t(story.headline)} intro={t(story.quote)} />

      <section className="section wrap split split--story" data-theme="paper">
        <div className="split__media">
          <div className="arch split__arch grain" data-reveal="arch">
            <Picture id="boutique" alt={t({ en: 'The Maison boutique: a marble counter, gift boxes and golden light', ar: 'متجر الدار: طاولة رخامية وعلب هدايا وضوء ذهبي' })} sizes="(max-width: 56rem) 90vw, 46vw" />
          </div>
        </div>
        <div className="split__copy">
          {story.chapters.map((chapter, c) => (
            <Fragment key={chapter.title.en}>
              <p className="eyebrow" data-reveal="fade">{t(chapter.title)}</p>
              {chapter.paragraphs.map((p, i) => <p key={p.en} className={c === 0 && i === 0 ? 't-lead' : 'muted'} data-reveal="fade">{t(p)}</p>)}
            </Fragment>
          ))}
          <p className="eyebrow" data-reveal="fade">{t(story.name.title)}</p>
          <p className="muted" data-reveal="fade">{t(story.name.text)}</p>
          <ul className="story-lines" data-reveal="stagger">
            {story.lines.map((line) => <li key={line.en} className="display t-sub">{t(line)}</li>)}
          </ul>
        </div>
      </section>

      <section className="section wrap about" data-theme="ivory">
        <p className="eyebrow" data-reveal="fade">{t(patisserie.title)}</p>
        <div className="about__grid">
          <div className="about__copy">
            <p className="t-lead" data-reveal="fade">{t(patisserie.headline)}</p>
            {patisserie.intro.map((p) => <p key={p.en} className="muted" data-reveal="fade">{t(p)}</p>)}
          </div>
          <div>
            <h2 className="eyebrow eyebrow--plain" data-reveal="fade">{t(ui.chapters.expertise)}</h2>
            <ul className="plain-list" data-reveal="stagger">
              {expertise.map((item) => <li key={item.name.en}>{t(item.name)}</li>)}
            </ul>
          </div>
        </div>
        <div className="about__promise">
          <h2 className="eyebrow eyebrow--plain" data-reveal="fade">{t(ui.chapters.promise)}</h2>
          {promise.map((line, i) => <p key={line.en} className={`display t-sub ${i % 2 ? 'accent-word' : ''}`} data-reveal="fade">{t(line)}</p>)}
        </div>
      </section>

      <section className="section wrap vision" data-theme="mocha">
        <p className="eyebrow" data-reveal="fade">{t(COPY.vision)}</p>
        <Words as="h2" className="display t-title vision__title" text={t(vision.title)} />
        <div className="columns">
          {vision.paragraphs.map((p) => <p key={p.en} className="muted" data-reveal="fade">{t(p)}</p>)}
        </div>
        <p className="display t-sub vision__closing" data-reveal="fade">{t(vision.closing)}</p>
      </section>

      <section className="section wrap split" data-theme="deep">
        <div className="split__copy">
          <p className="eyebrow" data-reveal="fade">{t(ui.chapters.promise)}</p>
          <Pillars />
        </div>
        <div className="split__media">
          <div className="arch arch--ogee split__arch grain" data-reveal="fade">
            <Picture id="mood-pralines" alt={t({ en: 'Chocolates finished with gold details', ar: 'شوكولاتة بتفاصيل ذهبية' })} sizes="(max-width: 56rem) 90vw, 40vw" />
          </div>
        </div>
      </section>

      <section className="mission-band grain" aria-hidden="true">
        <Picture id="atelier" alt="" data-parallax="0.08" />
      </section>

      <section className="section wrap mission" data-theme="paper">
        <p className="eyebrow" data-reveal="fade">{t(COPY.mission)}</p>
        <div className="statement" data-reveal="fade">
          <p className="t-lead">{t(mission.statement)}</p>
        </div>
      </section>

      <section className="section wrap" data-theme="blush">
        <p className="eyebrow" data-reveal="fade">{t(COPY.fulfil)}</p>
        <ol className="fulfil">
          {fulfil.map((item, i) => (
            <li key={item.title.en} data-reveal="fade">
              <span className="fulfil__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="display t-sub">{t(item.title)}</h3>
              <p className="muted">{t(item.text)}</p>
            </li>
          ))}
        </ol>
        <div className="commitment">
          <h3 className="eyebrow eyebrow--plain" data-reveal="fade">{t(COPY.commitment)}</h3>
          <ul data-reveal="stagger">
            {commitment.map((line) => <li key={line.en} className="display t-sub">{t(line)}</li>)}
          </ul>
        </div>
      </section>

      <section className="section wrap world" data-theme="paper">
        <div className="world__head">
          <p className="eyebrow" data-reveal="fade">{t(COPY.world)}</p>
          <ul className="world__words" data-reveal="stagger">
            {world.words.map((w) => <li key={w.en} className="display t-sub">{t(w)}</li>)}
          </ul>
        </div>
        <div className="collage">
          {COLLAGE.map(([id, en, ar], i) => (
            <figure key={id} className={`collage__item collage__item--${i}`}>
              <div className={`frame grain ${i === 2 ? 'arch' : ''}`} data-reveal="arch">
                <Picture id={id} alt={t({ en, ar })} sizes="(max-width: 56rem) 90vw, 36vw" />
              </div>
            </figure>
          ))}
        </div>
        <div className="world__notes">
          <div>
            <h3 className="eyebrow eyebrow--plain">{t(COPY.essence)}</h3>
            <p className="t-lead">{t(world.essence)}</p>
          </div>
          <div>
            <h3 className="eyebrow eyebrow--plain">{t(COPY.experience)}</h3>
            <ul className="plain-list">
              {world.experience.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
          </div>
        </div>
        <ul className="palette" aria-label={t({ en: 'Brand colours', ar: 'ألوان العلامة' })}>
          {world.palette.map((swatch) => (
            <li key={swatch.value} style={{ '--swatch': swatch.value }} data-reveal="fade"><span>{t(swatch.name)}</span></li>
          ))}
        </ul>
      </section>

      <section className="section wrap future" data-theme="deep">
        <p className="eyebrow" data-reveal="fade">{t(COPY.future)}</p>
        <div className="future__grid">
          <p className="t-lead" data-reveal="fade">{t(future.intro)}</p>
          <div>
            <h2 className="eyebrow eyebrow--plain" data-reveal="fade">{t(COPY.priorities)}</h2>
            <ol className="priorities">
              {future.priorities.map((item, i) => (
                <li key={item.en} data-reveal="fade"><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{t(item)}</li>
              ))}
            </ol>
          </div>
        </div>
        {whatsappLink('') ? (
          <div className="actions" data-reveal="fade">
            <a className="btn btn--whatsapp" href={whatsappLink(t(ui.collaborateGreeting))} target="_blank" rel="noopener noreferrer">
              <span>{t({ en: 'Collaborate with us', ar: 'تعاونوا معنا' })}</span>
              <SocialIcon id="whatsapp" />
              <span className="sr-only">{t(ui.newTab)}</span>
            </a>
          </div>
        ) : null}
      </section>
    </Page>
  )
}
