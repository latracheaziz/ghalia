import { useLang } from '../../state/LangContext'
import { ui } from '../../content/ui'
import { Picture } from '../ui/Picture'
import { TLink } from '../ui/TLink'

const DOORS = [
  { to: '/order', image: 'mood-open-box', title: { en: 'Order', ar: 'اطلب' }, text: { en: 'Signature trays and gift collections that tell the story of the person who receives them.', ar: 'أطباق وتشكيلات تحكي قصة اللي تهديه.' }, alt: { en: 'Hands opening a box of GHALIA chocolates', ar: 'يدان تفتحان علبة شوكولاتة غالية' } },
  { to: '/studio', image: 'pergola-ceremony', title: { en: 'Plan', ar: 'خطط' }, text: { en: 'See your celebration before it begins.', ar: 'شوفوا فرحتكم قبل لا تبدأ.' }, alt: { en: 'A ceremony aisle under a flowered pergola', ar: 'ممر حفل تحت برجولة مزهرة' } },
  { to: '/corporate', image: 'national-5', title: { en: 'Gift', ar: 'أهدِ' }, text: { en: 'For prestigious brands and VIP clients, a gift is a statement.', ar: 'للعلامات المرموقة وعملاء كبار الشخصيات، الهدية رسالة.' }, alt: { en: 'GHALIA gift boxes in emerald and gold', ar: 'علب هدايا غالية بالزمردي والذهبي' } },
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
