import { useState } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/ui/PageHero'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { Button } from '../components/ui/Button'
import { Scene } from '../three/Scene'
import { useLang } from '../state/LangContext'
import { fulfil, commitment } from '../content/maison'
import { haloTray } from '../content/events'
import { ui } from '../content/ui'

const COPY = {
  page: { en: 'The Atelier', ar: 'المشغل' },
  title: commitment[0],
  chocolates: { en: 'Handcrafted Chocolates', ar: 'شوكولاتة مصنوعة باليد' },
  chocolatesLead: {
    en: 'Premium pralines, filled and finished by hand, using carefully selected ingredients and exceptional artisanal techniques.',
    ar: 'برالين فاخرة تُعبّأ وتُزيَّن باليد، من مكوّنات منتقاة بعناية وبأساليب حرفية متقنة.',
  },
  chocolatesMore: {
    en: 'Each piece is small enough to hold in your palm and made with enough care to remember for a long time.',
    ar: 'كل قطعة بحجم كفّك، ومصنوعة بعناية تخلّيك تذكرها زمن.',
  },
  pastries: { en: 'Luxury Pastries and Desserts', ar: 'حلويات ومعجنات فاخرة' },
  pastriesLead: {
    en: 'Signature pastries designed with elegance, where refined flavor meets a presentation worthy of the table it arrives on.',
    ar: 'معجنات خاصة بنا مصمّمة بأناقة، فيها نكهة راقية وتقديم يليق بالطاولة اللي توصلها.',
  },
  trays: { en: 'Signature Chocolate Trays', ar: 'أطباق الشوكولاتة الخاصة' },
  exclusive: {
    en: 'Statement trays designed exclusively by Ghalia for welcoming guests, honoring occasions and elevating every celebration. Available only through Ghalia.',
    ar: 'أطباق مميزة صمّمتها غالية حصرياً لاستقبال الضيوف وتكريم المناسبات ورفع مستوى كل احتفال. ما تلقونها إلا عندنا.',
  },
}

function HaloStudio() {
  const { t } = useLang()
  const [view, setView] = useState('front')
  return (
    <div className="halo__stage" data-cursor={t(ui.drag)}>
      <Scene name="halo" view={view} fallback="halo-tray" fallbackAlt={t(haloTray.name)} note />
      <div className="choices halo__views" role="group" aria-label={t(haloTray.name)}>
        {Object.entries(ui.haloViews).map(([id, label]) => (
          <button key={id} type="button" className="choice" aria-pressed={view === id} onClick={() => setView(id)}>{t(label)}</button>
        ))}
      </div>
    </div>
  )
}

export default function Atelier() {
  const { t } = useLang()
  return (
    <Page title={t(COPY.page)} description={t(fulfil[0].text)}>
      <PageHero eyebrow={t(COPY.page)} title={t(COPY.title)} intro={t(fulfil[0].text)} silk={['#6B3F26', '#21120A']} tone="light" />

      <section id="chocolates" className="section wrap split" data-theme="paper">
        <div className="split__copy">
          <p className="eyebrow" data-reveal="fade">01</p>
          <Words as="h2" className="display t-title" text={t(COPY.chocolates)} />
          <p className="t-lead" data-reveal="fade">{t(COPY.chocolatesLead)}</p>
          <p className="muted" data-reveal="fade">{t(COPY.chocolatesMore)}</p>
        </div>
        <div className="split__media split__media--stack">
          <div className="arch split__arch grain" data-reveal="arch">
            <Picture id="mood-craft" alt={t({ en: 'A gold nozzle finishing chocolates by hand', ar: 'نقش ذهبي على الشوكولاتة باليد' })} sizes="(max-width: 56rem) 90vw, 40vw" />
          </div>
          <div className="frame split__float grain" data-reveal="fade">
            <Picture id="mood-cacao" alt={t({ en: 'Cacao pods and beans', ar: 'ثمار وحبوب الكاكاو' })} sizes="20rem" />
          </div>
        </div>
      </section>

      <section id="pastries" className="section wrap split split--reverse" data-theme="blush">
        <div className="split__media">
          <div className="arch arch--ogee split__arch grain" data-reveal="fade">
            <Picture id="classic-3" alt={t({ en: 'Macarons and chocolates in open GHALIA drawer boxes', ar: 'ماكرون وشوكولاتة في علب غالية المفتوحة' })} sizes="(max-width: 56rem) 90vw, 40vw" />
          </div>
        </div>
        <div className="split__copy">
          <p className="eyebrow" data-reveal="fade">02</p>
          <Words as="h2" className="display t-title" text={t(COPY.pastries)} />
          <p className="t-lead" data-reveal="fade">{t(COPY.pastriesLead)}</p>
        </div>
      </section>

      <section id="halo" className="section wrap halo" data-theme="paper">
        <header className="halo__head">
          <p className="eyebrow" data-reveal="fade">03 · {t(COPY.trays)}</p>
          <p className="eyebrow eyebrow--plain" data-reveal="fade">{t(haloTray.label)}</p>
          <Words as="h2" className="display t-hero" text={t(haloTray.name)} />
          <p className="t-lead measure" data-reveal="fade">{t(haloTray.intro)}</p>
          <p className="muted" data-reveal="fade">{t(haloTray.kind)}</p>
        </header>
        <HaloStudio />
        <dl className="halo__spec">
          <div data-reveal="fade">
            <dt className="eyebrow eyebrow--plain">{t(ui.haloDimensions)}</dt>
            <dd className="display t-sub">{t(haloTray.width)} × {t(haloTray.height)}</dd>
          </div>
          <div data-reveal="fade">
            <dt className="eyebrow eyebrow--plain">{t(ui.haloCapacity)}</dt>
            <dd>{t(haloTray.capacity)}</dd>
          </div>
          <div data-reveal="fade">
            <dt className="eyebrow eyebrow--plain">{t(ui.haloMaterials)}</dt>
            <dd><ul className="plain-list">{haloTray.materials.map((m) => <li key={m.id}>{t(m.name)}</li>)}</ul></dd>
          </div>
          <div data-reveal="fade">
            <dt className="eyebrow eyebrow--plain">{t(ui.haloFeatures)}</dt>
            <dd><ul className="plain-list">{haloTray.features.map((f) => <li key={f.en}>{t(f)}</li>)}</ul></dd>
          </div>
        </dl>
        <figure className="halo__sheet frame" data-reveal="fade">
          <Picture id="halo-board" alt={t({ en: 'The Halo Tray concept sheet with front, side and back views', ar: 'لوحة مفهوم صينية الهالة بالمناظر الأمامية والجانبية والخلفية' })} sizes="(max-width: 56rem) 90vw, 60vw" />
        </figure>
        <p className="display t-sub" data-reveal="fade">{t(COPY.exclusive)}</p>
        <div className="actions" data-reveal="fade">
          <Button to="/weddings">{t(ui.planEvent)}</Button>
          <Button to="/weddings#enquire" variant="ghost">{t(ui.enquire)}</Button>
        </div>
      </section>
    </Page>
  )
}
