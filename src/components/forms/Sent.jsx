import { useEffect, useRef } from 'react'
import { useLang } from '../../state/LangContext'
import { ui } from '../../content/ui'
import { Button } from '../ui/Button'

export function Sent({ reference, onAgain }) {
  const { t } = useLang()
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus({ preventScroll: true }) }, [])

  return (
    <div ref={ref} className="sent" role="status" tabIndex={-1} style={{ outline: 'none' }}>
      <h3 className="display t-sub">{t(ui.sentTitle)}</h3>
      <p className="sent__ref">{reference}</p>
      <p className="muted measure">{t(ui.sentBody)}</p>
      {onAgain ? <Button variant="ghost" icon={false} onClick={onAgain}>{t(ui.sendAnother)}</Button> : null}
    </div>
  )
}
