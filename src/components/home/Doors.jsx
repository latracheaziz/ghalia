import { useLang } from '../../state/LangContext'
import { ui } from '../../content/ui'
import { Picture } from '../ui/Picture'
import { TLink } from '../ui/TLink'

const DOORS = [
  { to: '/order', image: 'mood-open-box', title: { en: 'Order', ar: 'اطلب' }, text: { en: 'Compose a gift from any collection.', ar: 'نسّقوا هدية من أي مجموعة.' }, alt: { en: 'Hands opening a box of GHALIA chocolates', ar: 'يدان تفتحان علبة شوكولاتة غالية' } },
  { to: '/studio', image: 'pergola-ceremony', title: { en: 'Plan', ar: 'خطط' }, text: { en: 'Sketch your celebration in 3D.', ar: 'ارسموا مناسبتكم بتقنية ثلاثية الأبعاد.' }, alt: { en: 'A ceremony aisle under a flowered pergola', ar: 'ممر حفل تحت برجولة مزهرة' } },
  { to: '/corporate', image: 'national-5', title: { en: 'Gift', ar: 'أهدِ' }, text: { en: 'Corporate gifting for prestigious brands.', ar: 'هدايا الشركات للعلامات المرموقة.' }, alt: { en: 'GHALIA gift boxes in emerald and gold', ar: 'علب هدايا غالية بالزمردي والذهبي' } },
]

/** Three arches for the three things people come here to do. */
export function Doors() {
  const { t } = useLang()
  return (
    <section className="section wrap doors" data-theme="ivory">
      <h2 className="sr-only">{t(ui.discover)}</h2>
      <div className="doors__row">
        {DOORS.map((door) => (
          <TLink key={door.to} to={door.to} className="door" data-cursor={t(ui.discover)}>
            <div className="arch door__image grain" data-reveal="arch">
              <Picture id={door.image} alt={t(door.alt)} sizes="(max-width: 56rem) 90vw, 30vw" />
            </div>
            <h3 className="display t-title">{t(door.title)}</h3>
            <p className="muted">{t(door.text)}</p>
          </TLink>
        ))}
      </div>
    </section>
  )
}
