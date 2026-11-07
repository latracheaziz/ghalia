import { useState } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/ui/PageHero'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { Button, TextLink } from '../components/ui/Button'
import { EnquiryForm } from '../components/forms/EnquiryForm'
import { useLang } from '../state/LangContext'
import { journey, pergola } from '../content/events'
import { ui } from '../content/ui'

const COPY = {
  page: { en: 'Weddings and Events', ar: 'الأعراس والمناسبات' },
  meta: { en: 'Luxury Wedding and Event Planning', ar: 'تخطيط أعراس ومناسبات فاخرة' },
  description: { en: 'Ghalia', ar: 'غالية' },
  headline: { en: 'See your celebration before it begins.', ar: 'شوفوا فرحتكم قبل لا تبدأ.' },
  intro: {
    en: 'A wedding is not a date on a calendar. It is a story you tell once, in front of everyone you love. At Ghalia, we help you tell it beautifully.',
    ar: 'العرس مو تاريخ في التقويم. العرس قصة تنحكى مرة وحدة، قدّام كل اللي تحبونهم. وفي غالية نساعدكم تحكونها بأجمل صورة.',
  },
  planner: { en: 'Wedding Planner and Creative Design Team', ar: 'منسّقة الأعراس وفريق التصميم الإبداعي' },
  plannerText: {
    en: "With our in-house Wedding Planner and Creative Design Team, every celebration is designed around who you are: your personality, your aspirations and the way you want your guests to feel. From the first consultation to the final celebration, nothing is left to chance and nothing is borrowed from anyone else's story.",
    ar: 'مع منسّقة الأعراس وفريق التصميم الإبداعي عندنا، كل احتفال يُصمَّم على شخصيتكم وطموحكم وعلى الشعور اللي تبونه لضيوفكم. من أول جلسة لين آخر لحظة في الحفل، ما نترك شي للصدفة، وما نستعير شي من قصة غيركم.',
  },
  preview: {
    en: 'Before a single flower is placed, you walk through your event. Our immersive 3D concepts let you visualize the entrance, the ceremony, the tables, the lighting and the details, then refine them until it feels exactly right. Only then do we bring your vision to life.',
    ar: 'قبل لا توضع وردة وحدة، تمشون في مناسبتكم. تصاميمنا ثلاثية الأبعاد تخلّيكم تشوفون المدخل والزفّة والطاولات والإضاءة والتفاصيل، وتعدّلون عليها لين تكون زي ما تبون بالضبط. وبعدها نبدأ نحوّل الرؤية لواقع.',
  },
  journey: { en: 'How it works', ar: 'كيف نشتغل' },
  catering: { en: 'The Ghalia difference', ar: 'الفرق اللي تسوّيه غالية' },
  difference: {
    en: 'Everything is designed under one roof: the chocolates, the pastries, the trays, the decor and the planning. The result is a celebration that feels complete, because it was imagined as a whole.',
    ar: 'كل شي يتصمم تحت سقف واحد: الشوكولاتة والمعجنات والأطباق والديكور والتخطيط. والنتيجة احتفال متكامل، لأنه انتصوّر من البداية كوحدة وحدة.',
  },
  form: { en: "Let's begin your story.", ar: 'تعالوا نبدأ قصتكم.' },
}

/** The pergola's five spaces. Choosing one brings it into the large arch. */
function PergolaZones() {
  const { t } = useLang()
  const [active, setActive] = useState(0)
  return (
    <div className="zones">
      <div className="arch zones__view grain" data-reveal="fade">
        {pergola.zones.map((zone, i) => (
          <Picture key={zone.image} id={zone.image} alt={i === active ? t(zone.name) : ''} sizes="(max-width: 56rem) 90vw, 34vw" className={i === active ? 'is-on' : ''} />
        ))}
      </div>
      <ul className="zones__list">
        {pergola.zones.map((zone, i) => (
          <li key={zone.image} data-reveal="fade">
            <button type="button" className="display t-sub" aria-pressed={i === active} onClick={() => setActive(i)} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)}>
              {t(zone.name)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Weddings() {
  const { t } = useLang()
  return (
    <Page title={t(COPY.meta)} description={t(COPY.description)}>
      <PageHero eyebrow={t(COPY.page)} title={t(COPY.headline)} intro={t(COPY.intro)} silk={['#EBC8BA', '#B98378']}>
        <div className="actions" data-reveal="fade">
          <Button to="/studio">{t(ui.openStudio)}</Button>
        </div>
      </PageHero>

      <section className="section wrap split" data-theme="paper">
        <div className="split__copy">
          <p className="eyebrow" data-reveal="fade">{t(COPY.planner)}</p>
          <p className="t-lead" data-reveal="fade">{t(COPY.plannerText)}</p>
          <p className="muted" data-reveal="fade">{t(COPY.preview)}</p>
        </div>
        <div className="split__media">
          <div className="arch split__arch grain" data-reveal="arch">
            <Picture id="mood-arch" alt={t({ en: 'A flowered arch set for a celebration', ar: 'قوس مزهر مجهز لمناسبة' })} sizes="(max-width: 56rem) 90vw, 40vw" />
          </div>
        </div>
      </section>

      <section className="section wrap journey" data-theme="deep">
        <Words as="h2" className="display t-title" text={t(COPY.journey)} />
        <ol className="journey__steps">
          {journey.map((step, i) => (
            <li key={step.title.en} data-reveal="fade">
              <span className="journey__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="display t-sub">{t(step.title)}</h3>
              <p className="muted">{t(step.text)}</p>
            </li>
          ))}
        </ol>
        <div className="actions" data-reveal="fade">
          <Button to="/studio">{t(ui.openStudio)}</Button>
        </div>
      </section>

      <section className="section wrap pergola" data-theme="mocha">
        <div className="pergola__head">
          <p className="eyebrow" data-reveal="fade">{t(pergola.kind)}</p>
          <Words as="h2" className="display t-hero" text={t(pergola.name)} />
          <p className="t-lead measure" data-reveal="fade">{t(pergola.intro)}</p>
        </div>
        <div className="frame pergola__image grain" data-reveal="fade">
          <Picture id="pergola" alt={t({ en: 'The GHALIA de Chocolat pergola at dusk', ar: 'برجولة غالية عند الغروب' })} sizes="(max-width: 56rem) 90vw, 70vw" />
        </div>
        <PergolaZones />
        <ul className="pergola__qualities" data-reveal="stagger">
          {pergola.qualities.map((q) => <li key={q.en}>{t(q)}</li>)}
        </ul>
      </section>

      <section id="catering" className="section wrap split split--reverse" data-theme="blush">
        <div className="split__media">
          <div className="arch split__arch grain" data-reveal="arch">
            <Picture id="hosts" alt={t({ en: 'GHALIA hosts in ivory and blush uniforms presenting chocolate trays', ar: 'مضيفات غالية بزي عاجي ووردي يقدمن صواني الشوكولاتة' })} sizes="(max-width: 56rem) 90vw, 40vw" />
          </div>
        </div>
        <div className="split__copy">
          <Words as="h2" className="display t-title" text={t(COPY.catering)} />
          <p className="t-lead" data-reveal="fade">{t(COPY.difference)}</p>
          <div data-reveal="fade"><TextLink to="/atelier#halo">{t({ en: 'See the Halo Tray', ar: 'شاهدوا صينية الهالة' })}</TextLink></div>
        </div>
      </section>

      <section id="enquire" className="section wrap form-band" data-theme="paper">
        <div>
          <p className="eyebrow" data-reveal="fade">{t(ui.planEvent)}</p>
          <Words as="h2" className="display t-title" text={t(COPY.form)} />
        </div>
        <div data-reveal="fade"><EnquiryForm kind="wedding" /></div>
      </section>
    </Page>
  )
}
