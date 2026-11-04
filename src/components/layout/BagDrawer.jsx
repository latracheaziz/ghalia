import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { pauseScroll, resumeScroll } from '../../animations/lenis'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useBag } from '../../state/BagContext'
import { useLang } from '../../state/LangContext'
import { ui } from '../../content/ui'
import { describeItem } from '../../utils/bag'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { Quantity } from '../ui/Quantity'

export function BagLine({ item }) {
  const { t } = useLang()
  const { setQuantity, remove } = useBag()
  const { collection, format, filling } = describeItem(item)
  if (!collection) return null

  return (
    <motion.li layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }} className="bag-item">
      <div className="arch bag-item__image"><Picture id={collection.images[0]} alt="" sizes="5rem" /></div>
      <div>
        <p className="bag-item__name">{t(collection.name)}</p>
        <p className="bag-item__meta">{t(format?.label)}{filling ? ` · ${t(filling.label)}` : ''}</p>
        {item.note ? <p className="bag-item__note">“{item.note}”</p> : null}
        <div className="bag-item__row">
          <Quantity value={item.quantity} onChange={(q) => setQuantity(item.id, q)} />
          <button type="button" className="bag-item__remove" onClick={() => remove(item.id)}>{t(ui.remove)}</button>
        </div>
      </div>
    </motion.li>
  )
}

export function BagDrawer() {
  const { items, open, setOpen } = useBag()
  const { t, rtl } = useLang()
  const panel = useRef(null)
  const close = useCallback(() => setOpen(false), [setOpen])

  useFocusTrap(panel, open, close)

  useEffect(() => {
    if (!open) return
    pauseScroll()
    return resumeScroll
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div key="scrim" className="drawer-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside
            key="drawer"
            ref={panel}
            className="drawer"
            data-theme="paper"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label={t(ui.bag)}
            initial={{ x: rtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 34 }}
          >
            <div className="drawer__head">
              <h2 className="display t-sub">{t(ui.bag)}</h2>
              <button type="button" className="header__btn" onClick={close} aria-label={t(ui.close)}><X size={20} aria-hidden="true" /></button>
            </div>
            {items.length ? (
              <>
                <ul className="drawer__list">
                  <AnimatePresence initial={false}>
                    {items.map((item) => <BagLine key={item.id} item={item} />)}
                  </AnimatePresence>
                </ul>
                <div className="drawer__foot">
                  <p className="muted" style={{ fontSize: 'var(--t-small)' }}>{t(ui.pricesNote)}</p>
                  <Button to="/order#details" onClick={close}>{t(ui.continueToDetails)}</Button>
                </div>
              </>
            ) : (
              <div className="drawer__empty">
                <p className="display t-sub">{t(ui.bagEmpty)}</p>
                <Button to="/order" onClick={close}>{t(ui.orderNow)}</Button>
              </div>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
