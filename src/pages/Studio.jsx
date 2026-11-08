import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Download, Link2 } from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { SocialIcon } from '../components/brand/SocialIcon'
import { Scene } from '../three/Scene'
import { pauseScroll, resumeScroll } from '../animations/lenis'
import { useLang } from '../state/LangContext'
import { studio } from '../content/events'
import { ui } from '../content/ui'
import { whatsappLink } from '../utils/whatsapp'

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
  const [copied, setCopied] = useState(false)
  const canvas = useRef(null)

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

  // The set owns the whole screen, so the wheel should orbit nothing and scroll nothing.
  useEffect(() => {
    pauseScroll()
    return resumeScroll
  }, [])

  // The concept goes to the Maison on WhatsApp, written out and with its link, so they open the same design.
  const label = (list, id) => t(list.find((o) => o.id === id).label)
  const sendLink = whatsappLink([
    t(ui.studioGreeting),
    `• ${t(ui.studioSetting)}: ${label(studio.settings, concept.setting)}`,
    `• ${t(ui.studioPalette)}: ${label(studio.palettes, concept.palette)}`,
    `• ${t(ui.studioFlorals)}: ${label(studio.florals, concept.floral)}`,
    `• ${t(ui.studioMood)}: ${label(studio.moods, concept.mood)}`,
    ...(concept.setting !== 'pergola' && concept.tray ? [`• ${t(ui.studioTray)}`] : []),
    ...(typeof window === 'undefined' ? [] : ['', window.location.href]),
  ].join('\n'))

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
            {sendLink ? (
              <a className="btn btn--whatsapp" href={sendLink} target="_blank" rel="noopener noreferrer">
                <span>{t(ui.studioSend)}</span>
                <SocialIcon id="whatsapp" />
                <span className="sr-only">{t(ui.newTab)}</span>
              </a>
            ) : <Button to="/contact">{t(ui.enquire)}</Button>}
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
    </Page>
  )
}
