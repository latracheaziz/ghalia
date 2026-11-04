import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Download, Link2, X } from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { EnquiryForm } from '../components/forms/EnquiryForm'
import { Scene } from '../three/Scene'
import { pauseScroll, resumeScroll } from '../animations/lenis'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useLang } from '../state/LangContext'
import { studio } from '../content/events'
import { ui } from '../content/ui'

const DEFAULTS = { setting: 'halo', palette: 'blush', floral: 'full', mood: 'golden', tray: true }

function readConcept(params) {
  const pick = (key, list) => (list.some((o) => o.id === params.get(key)) ? params.get(key) : DEFAULTS[key])
  return {
    setting: pick('setting', studio.settings),
    palette: pick('palette', studio.palettes),
    floral: pick('floral', studio.florals),
    mood: pick('mood', studio.moods),
    tray: params.get('tray') !== '0',
  }
}

function Choice({ legend, options, value, onChange, swatch }) {
  const { t } = useLang()
  return (
    <fieldset className="studio__group">
      <legend className="eyebrow eyebrow--plain">{legend}</legend>
      <div className="choices">
        {options.map((option) => (
          <button key={option.id} type="button" className="choice" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>
            {swatch ? <i className="studio__swatch" style={{ background: option.primary }} aria-hidden="true" /> : null}
            {t(option.label)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default function Studio() {
  const { t } = useLang()
  const [params, setParams] = useSearchParams()
  const concept = useMemo(() => readConcept(params), [params])
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvas = useRef(null)
  const dialog = useRef(null)

  const update = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(key, value)
      return next
    }, { replace: true })
  }, [setParams])

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t(ui.studioShare), window.location.href)
    }
  }

  const save = () => {
    canvas.current?.toBlob((blob) => {
      if (!blob) return
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `ghalia-concept-${concept.setting}.png`
      link.click()
      URL.revokeObjectURL(link.href)
    })
  }

  const closeForm = useCallback(() => setSending(false), [])
  useFocusTrap(dialog, sending, closeForm)

  // The set owns the whole screen, so the wheel should orbit nothing and scroll nothing.
  useEffect(() => {
    pauseScroll()
    return resumeScroll
  }, [])

  const payload = useMemo(() => ({ ...concept, link: typeof window === 'undefined' ? '' : window.location.href }), [concept])

  return (
    <Page title={t(ui.studioTitle)} description={t(ui.studioIntro)}>
      <div className="studio">
        <div className="studio__stage" data-tone={concept.mood === 'evening' ? 'light' : 'dark'}>
          <Scene name="event" concept={concept} onCanvas={(el) => { canvas.current = el }} fallback="pergola" fallbackAlt={t(ui.studioTitle)} note />
          <p className="studio__hint">{t(ui.studioDragHint)}</p>
        </div>
        <aside className="studio__panel" data-theme="paper" data-lenis-prevent>
          <div>
            <h1 className="display t-sub">{t(ui.studioTitle)}</h1>
            <p className="muted studio__intro">{t(ui.studioIntro)}</p>
          </div>
          <Choice legend={t(ui.studioSetting)} options={studio.settings} value={concept.setting} onChange={(v) => update('setting', v)} />
          <Choice legend={t(ui.studioPalette)} options={studio.palettes} value={concept.palette} onChange={(v) => update('palette', v)} swatch />
          <Choice legend={t(ui.studioFlorals)} options={studio.florals} value={concept.floral} onChange={(v) => update('floral', v)} />
          <Choice legend={t(ui.studioMood)} options={studio.moods} value={concept.mood} onChange={(v) => update('mood', v)} />
          {concept.setting === 'pergola' ? null : (
            <label className="check">
              <input type="checkbox" checked={concept.tray} onChange={(e) => update('tray', e.target.checked ? '1' : '0')} />
              <span>{t(ui.studioTrayOn)}</span>
            </label>
          )}
          <div className="studio__actions">
            <Button onClick={() => setSending(true)}>{t(ui.studioSend)}</Button>
            <div className="studio__tools">
              <button type="button" className="link" onClick={save}><Download aria-hidden="true" /><span>{t(ui.studioSave)}</span></button>
              <button type="button" className="link" onClick={share}>
                {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                <span aria-live="polite">{t(copied ? ui.studioCopied : ui.studioShare)}</span>
              </button>
            </div>
            <p className="muted studio__note">{t(ui.studioDisclaimer)}</p>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {sending ? (
          <motion.div key="form" className="drawer-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeForm} />
        ) : null}
        {sending ? (
          <motion.div
            key="panel"
            ref={dialog}
            className="drawer studio__form"
            data-theme="paper"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label={t(ui.studioSend)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <div className="drawer__head">
              <h2 className="display t-sub">{t(ui.studioSend)}</h2>
              <button type="button" className="header__btn" onClick={closeForm} aria-label={t(ui.close)}><X size={20} aria-hidden="true" /></button>
            </div>
            <div className="studio__form-body"><EnquiryForm kind="wedding" concept={payload} /></div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Page>
  )
}
