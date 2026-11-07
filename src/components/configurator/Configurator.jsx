import { useCallback, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Box, Check, RotateCcw } from 'lucide-react'
import { useLang } from '../../state/LangContext'
import { collections, findCollection } from '../../content/collections'
import { ui } from '../../content/ui'
import { BOXES, ringOf } from '../../three/configurator/boxes.js'
import { Scene } from '../../three/Scene'
import { prefersReducedMotion } from '../../utils/env'
import { whatsappLink } from '../../utils/whatsapp'
import { SocialIcon } from '../brand/SocialIcon'
import { Field } from '../forms/Field'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { Quantity } from '../ui/Quantity'

const STEPS = ['collection', 'format', 'filling', 'finish', 'review']

/** The format's real footprint as a small drawing, from the same data as the 3D box. */
function Silhouette({ format }) {
  const d = useMemo(() => {
    const ring = ringOf(format, 0)
    let path = ''
    for (let i = 0; i < ring.length; i += 6) path += `${i ? 'L' : 'M'}${ring[i].toFixed(2)} ${ring[i + 1].toFixed(2)}`
    return `${path}Z`
  }, [format])
  return <svg viewBox="-3 -3 6 6" aria-hidden="true"><path d={d} /></svg>
}

function CollectionStep({ value, onPick }) {
  const { t } = useLang()
  return (
    <div className="cfg-grid">
      {collections.map((c) => (
        <button key={c.slug} type="button" className="cfg-tile" aria-pressed={value === c.slug} onClick={() => onPick(c.slug)}>
          <span className="arch cfg-tile__image"><Picture id={c.images[0]} alt="" sizes="6rem" /></span>
          <span>{t(c.name)}</span>
        </button>
      ))}
    </div>
  )
}

function FormatStep({ collection, value, onPick }) {
  const { t } = useLang()
  return (
    <div className="cfg-grid cfg-grid--shapes">
      {collection.formats.map((f) => (
        <button key={f.id} type="button" className="cfg-tile cfg-tile--shape" aria-pressed={value === f.id} onClick={() => onPick(f.id)}>
          <Silhouette format={f.id} />
          <span>{t(f.label)}</span>
        </button>
      ))}
    </div>
  )
}

function FillingStep({ collection, value, onPick, isBag }) {
  const { t } = useLang()
  return (
    <>
      <div className="choices cfg-fillings">
        {collection.fillings.map((f) => (
          <button key={f.id} type="button" className="choice" aria-pressed={value === f.id} onClick={() => onPick(f.id)}>{t(f.label)}</button>
        ))}
      </div>
      {isBag ? <p className="muted cfg-note">{t(ui.bagContents)}</p> : null}
    </>
  )
}

export function Configurator() {
  const { t } = useLang()
  const [params] = useSearchParams()

  const [slug, setSlug] = useState(() => findCollection(params.get('collection'))?.slug ?? collections[0].slug)
  const collection = findCollection(slug)
  const [format, setFormat] = useState(() => {
    const asked = params.get('format')
    return collection.formats.some((f) => f.id === asked) ? asked : collection.formats[0].id
  })
  const [filling, setFilling] = useState(collection.fillings[0].id)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [stepIndex, setStepIndex] = useState(() => (params.get('format') ? 1 : 0))
  const [boxOpen, setBoxOpen] = useState(false)
  const [viewKey, setViewKey] = useState(0)
  const [status, setStatus] = useState({})
  const direction = useRef(1)

  const box = BOXES[format]
  const step = STEPS[stepIndex]
  const openable = box.open !== 'none'

  const goTo = useCallback((index) => {
    direction.current = index >= stepIndex ? 1 : -1
    setStepIndex(index)
    // The box opens to show its contents, and closes for everything else.
    setBoxOpen(STEPS[index] === 'filling')
    setViewKey((k) => k + 1)
  }, [stepIndex])

  const pickCollection = (next) => {
    const c = findCollection(next)
    setSlug(next)
    if (!c.formats.some((f) => f.id === format)) setFormat(c.formats[0].id)
    if (!c.fillings.some((f) => f.id === filling)) setFilling(c.fillings[0].id)
  }

  const onToggle = useCallback(() => setBoxOpen((v) => !v), [])
  const onStatus = useCallback((patch) => {
    setStatus((s) => (Object.keys(patch).every((key) => s[key] === patch[key]) ? s : { ...s, ...patch }))
  }, [])

  const config = useMemo(() => ({ collection: slug, format, filling, note }), [slug, format, filling, note])
  const formatLabel = collection.formats.find((f) => f.id === format)?.label
  const fillingLabel = collection.fillings.find((f) => f.id === filling)?.label
  const orderLink = whatsappLink([
    t(ui.orderGreeting),
    `• ${t(ui.stepCollection)}: ${t(collection.name)}`,
    `• ${t(ui.stepFormat)}: ${t(formatLabel)}`,
    `• ${t(ui.stepFilling)}: ${t(fillingLabel)}`,
    `• ${t(ui.quantity)}: ${quantity}`,
    ...(note.trim() ? [`• ${t(ui.giftNoteShort)}: ${note.trim()}`] : []),
  ].join('\n'))
  const stepTitles = [ui.stepCollection, ui.stepFormat, ui.stepFilling, ui.stepDetails, ui.stepReview]
  const slide = prefersReducedMotion() ? 0 : 26

  return (
    <section className="cfg" aria-label={t(ui.orderTitle)}>
      <div
        className="cfg__stage"
        data-tone="dark"
        data-lenis-prevent
        data-collection={slug}
        data-format={format}
        data-rendered-format={status.format}
        data-pieces={status.pieces}
        data-open={boxOpen}
      >
        <div className="cfg__backdrop arch" aria-hidden="true" />
        <Scene
          name="box"
          config={config}
          step={step}
          open={boxOpen}
          viewKey={viewKey}
          onToggle={onToggle}
          onStatus={onStatus}
          fallback={collection.images[0]}
          fallbackAlt={t(collection.title)}
          note
        />
        <p className="cfg__caption">
          <span className="display">{t(collection.name)}</span>
          <span>{t(formatLabel)}</span>
        </p>
        <div className="cfg__tools">
          {openable ? (
            <button type="button" className="cfg__tool" aria-pressed={boxOpen} onClick={onToggle}>
              <Box aria-hidden="true" />
              <span>{t(boxOpen ? ui.closeBox : ui.openBox)}</span>
            </button>
          ) : null}
          <button type="button" className="cfg__tool" onClick={() => setViewKey((k) => k + 1)}>
            <RotateCcw aria-hidden="true" />
            <span>{t(ui.resetView)}</span>
          </button>
        </div>
        <p className="cfg__hint">{t(ui.boxHint)}</p>
      </div>

      <div className="cfg__panel" data-theme="paper">
        <header className="cfg__head">
          <h1 className="display t-sub">{t(ui.orderTitle)}</h1>
          <p className="muted">{t(ui.orderIntro)}</p>
        </header>

        <nav aria-label={t(ui.orderTitle)}>
          <ol className="cfg-steps">
            {STEPS.map((name, i) => (
              <li key={name}>
                <button type="button" aria-current={i === stepIndex ? 'step' : undefined} className={i < stepIndex ? 'is-done' : ''} onClick={() => goTo(i)}>
                  <span className="cfg-steps__mark" aria-hidden="true">{i < stepIndex ? <Check /> : i + 1}</span>
                  <span className="cfg-steps__label">{t(stepTitles[i])}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="cfg__body">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction.current * slide }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction.current * -slide }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="display t-sub cfg__title">{t(stepTitles[stepIndex])}</h2>
              {step === 'collection' ? <CollectionStep value={slug} onPick={pickCollection} /> : null}
              {step === 'format' ? <FormatStep collection={collection} value={format} onPick={setFormat} /> : null}
              {step === 'filling' ? <FillingStep collection={collection} value={filling} onPick={setFilling} isBag={box.bag} /> : null}
              {step === 'finish' ? (
                <div className="cfg-finish">
                  <div className="field">
                    <span className="field__label">{t(ui.quantity)}</span>
                    <Quantity value={quantity} onChange={setQuantity} />
                  </div>
                  <Field label={t(ui.giftNote)} name="note" as="textarea" rows={3} maxLength={400} value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              ) : null}
              {step === 'review' ? (
                <dl className="cfg-review">
                  <div><dt>{t(ui.stepCollection)}</dt><dd>{t(collection.name)}</dd></div>
                  <div><dt>{t(ui.stepFormat)}</dt><dd>{t(formatLabel)}</dd></div>
                  <div><dt>{t(ui.stepFilling)}</dt><dd>{t(fillingLabel)}</dd></div>
                  <div><dt>{t(ui.quantity)}</dt><dd>{quantity}</dd></div>
                  {note.trim() ? <div><dt>{t(ui.giftNoteShort)}</dt><dd>{note.trim()}</dd></div> : null}
                </dl>
              ) : null}
              {step === 'review' ? <p className="notice cfg-note">{t(ui.pricesNote)}</p> : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="cfg__nav">
          {stepIndex > 0 ? <Button variant="ghost" icon={false} onClick={() => goTo(stepIndex - 1)}>{t(ui.back)}</Button> : <span />}
          {step === 'review'
            ? orderLink
              ? (
                <a className="btn btn--whatsapp" href={orderLink} target="_blank" rel="noopener noreferrer">
                  <span>{t(ui.orderWhatsApp)}</span>
                  <SocialIcon id="whatsapp" />
                  <span className="sr-only">{t(ui.newTab)}</span>
                </a>
              )
              : <Button to="/contact">{t(ui.enquire)}</Button>
            : <Button onClick={() => goTo(stepIndex + 1)}>{t(ui.next)}</Button>}
        </div>
      </div>
    </section>
  )
}
