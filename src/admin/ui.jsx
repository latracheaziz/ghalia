import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Check, ImagePlus, TriangleAlert, Upload, X } from 'lucide-react'
import { SocialIcon } from '../components/brand/SocialIcon'
import { LIBRARY, mediaSrc, resizeUpload } from './media'
import { platformById } from './platforms'

export const formatDate = (iso, withTime = true) => (iso
  ? new Intl.DateTimeFormat('en-GB', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(new Date(iso))
  : '')

/** A native modal dialog: focus trap, Escape and backdrop handled by the browser. */
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`adm-modal adm-modal--${size}`}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      data-lenis-prevent
    >
      {open ? (
        <div className="adm-modal__box">
          <header className="adm-modal__head">
            <h2>{title}</h2>
            <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </header>
          <div className="adm-modal__body">{children}</div>
          {footer ? <footer className="adm-modal__foot">{footer}</footer> : null}
        </div>
      ) : null}
    </dialog>
  )
}

/** `const [confirmUI, confirm] = useConfirm()`, then `if (await confirm({...}))`. */
export function useConfirm() {
  const [state, setState] = useState(null)
  const confirm = useCallback((options) => new Promise((resolve) => setState({ ...options, resolve })), [])
  const answer = (value) => {
    state?.resolve(value)
    setState(null)
  }
  const ui = (
    <Modal
      open={Boolean(state)}
      onClose={() => answer(false)}
      title={state?.title ?? 'Are you sure?'}
      size="sm"
      footer={(
        <>
          <button type="button" className="adm-btn" onClick={() => answer(false)}>Cancel</button>
          <button type="button" className={`adm-btn ${state?.danger ? 'adm-btn--danger' : 'adm-btn--primary'}`} onClick={() => answer(true)}>{state?.action ?? 'Confirm'}</button>
        </>
      )}
    >
      <p>{state?.message}</p>
    </Modal>
  )
  return [ui, confirm]
}

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const notify = useCallback((message, tone = 'ok') => {
    const id = Math.random()
    setToasts((list) => [...list, { id, message, tone }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), tone === 'error' ? 7000 : 3500)
  }, [])
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <p key={t.id} className={`adm-toast adm-toast--${t.tone}`}>
            {t.tone === 'error' ? <TriangleAlert size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const STATUS_LABEL = { draft: 'Draft', published: 'Published', scheduled: 'Scheduled', due: 'Due' }
export function StatusChip({ status }) {
  return <span className={`adm-chip adm-chip--${status}`}>{STATUS_LABEL[status] ?? status}</span>
}

export function PlatformIcons({ ids, size = 'sm' }) {
  return (
    <span className={`adm-platforms adm-platforms--${size}`}>
      {ids.map((id) => {
        const p = platformById(id)
        return p ? <span key={id} title={p.name} className="adm-platform-dot"><SocialIcon id={id} /><span className="sr-only">{p.name}</span></span> : null
      })}
    </span>
  )
}

export function Thumb({ item, alt = '', className = '' }) {
  const src = mediaSrc(item, 480)
  return src
    ? <img className={`adm-thumb ${className}`} src={src} alt={alt} loading="lazy" />
    : <span className={`adm-thumb adm-thumb--empty ${className}`} aria-hidden="true"><ImagePlus size={18} /></span>
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="adm-empty">
      {Icon ? <Icon size={28} aria-hidden="true" /> : null}
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

/** Picks a photo from the site's own library, or uploads one (downscaled before it is stored). */
export function MediaPicker({ open, onClose, onPick }) {
  const notify = useToast()
  const [busy, setBusy] = useState(false)

  const upload = async (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    try {
      for (const file of files) onPick(await resizeUpload(file))
      onClose()
    } catch {
      notify('That file could not be read as a photo. Try a JPG, PNG or WebP.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a photo" size="lg">
      <label className={`adm-upload ${busy ? 'is-busy' : ''}`}>
        <Upload size={20} aria-hidden="true" />
        <span><strong>{busy ? 'Preparing…' : 'Upload from this device'}</strong><small>JPG, PNG or WebP. Resized to 1400 px so it fits in the browser’s storage.</small></span>
        <input type="file" accept="image/*" multiple onChange={upload} disabled={busy} className="sr-only" />
      </label>
      <p className="adm-label">Or choose from the site’s photos</p>
      <ul className="adm-library">
        {LIBRARY.map((id) => (
          <li key={id}>
            <button type="button" onClick={() => { onPick({ kind: 'library', id }); onClose() }} aria-label={`Use photo ${id}`}>
              <img src={mediaSrc({ kind: 'library', id }, 480)} alt="" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div className="adm-segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? 'is-on' : ''} onClick={() => onChange(o.value)}>
          {o.label}{o.count != null ? <span className="adm-count">{o.count}</span> : null}
        </button>
      ))}
    </div>
  )
}
