import { Minus, Plus } from 'lucide-react'
import { ui } from '../../content/ui'
import { useLang } from '../../state/LangContext'

export function Quantity({ value, onChange, min = 1, max = 500 }) {
  const { t } = useLang()
  return (
    <div className="qty" role="group" aria-label={t(ui.quantity)}>
      <button type="button" aria-label={t(ui.decrease)} disabled={value <= min} onClick={() => onChange(value - 1)}><Minus aria-hidden="true" /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label={t(ui.increase)} disabled={value >= max} onClick={() => onChange(value + 1)}><Plus aria-hidden="true" /></button>
    </div>
  )
}
