import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarClock, Copy, Info, Pencil, Plus, Search, Send, Share2, Trash2, TriangleAlert, X } from 'lucide-react'
import { SocialIcon } from '../components/brand/SocialIcon'
import { collection, STORAGE_ERRORS, useCollection } from './store'
import { mediaSrc } from './media'
import { PLATFORMS, platformById, postWarnings } from './platforms'
import { EmptyState, formatDate, MediaPicker, PlatformIcons, Segmented, StatusChip, Thumb, useConfirm, useToast } from './ui'

const posts = collection('social')
const MAX_MEDIA = 4
const EMPTY = { caption: '', platforms: [], media: [], link: '', status: 'draft', scheduledAt: null, publishedAt: null }

/** A scheduled post whose time has passed is "due": nothing sends it until the backend exists. */
export const displayStatus = (p) => (p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) < new Date() ? 'due' : p.status)
const whenOf = (p) => p.status === 'published' ? p.publishedAt : p.status === 'scheduled' ? p.scheduledAt : p.updatedAt
const excerpt = (p) => p.caption.trim() || (p.media.length ? 'Photo post' : 'Empty post')

// datetime-local works in local time without a zone.
const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export function PreviewBanner() {
  return (
    <p className="adm-banner"><Info size={16} aria-hidden="true" /> Preview mode: posts are saved in this browser only. Nothing is sent to the platforms until the backend and the account connections are added.</p>
  )
}

export function SocialList({ onEdit }) {
  const all = useCollection('social')
  const notify = useToast()
  const [confirmUI, confirm] = useConfirm()
  const [status, setStatus] = useState('all')
  const [platform, setPlatform] = useState('all')
  const [query, setQuery] = useState('')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...all]
      .filter((p) => status === 'all' || p.status === status)
      .filter((p) => platform === 'all' || p.platforms.includes(platform))
      .filter((p) => !q || p.caption.toLowerCase().includes(q))
      .sort((a, b) => (whenOf(b) ?? '').localeCompare(whenOf(a) ?? ''))
  }, [all, status, platform, query])

  const count = (s) => all.filter((p) => s === 'all' || p.status === s).length

  const duplicate = (p) => {
    try {
      const { id, createdAt, updatedAt, ...rest } = p
      posts.save({ ...rest, status: 'draft', scheduledAt: null, publishedAt: null })
      notify('Post duplicated as a draft.')
    } catch (e) { notify(STORAGE_ERRORS[e.message], 'error') }
  }

  const remove = async (p) => {
    if (!(await confirm({ title: 'Delete this post?', message: `“${excerpt(p).slice(0, 80)}” will be removed for good.`, action: 'Delete', danger: true }))) return
    posts.remove(p.id)
    notify('Post deleted.')
  }

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Social media</h1>
          <p className="adm-muted">Write once, choose where it goes.</p>
        </div>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => onEdit('new')}><Plus size={16} aria-hidden="true" /> New post</button>
      </div>
      <PreviewBanner />

      {all.length ? (
        <>
          <div className="adm-toolbar">
            <label className="adm-search">
              <Search size={16} aria-hidden="true" />
              <input type="search" placeholder="Search captions" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search captions" />
            </label>
            <Segmented label="Filter by status" value={status} onChange={setStatus} options={[
              { value: 'all', label: 'All', count: count('all') },
              { value: 'scheduled', label: 'Scheduled', count: count('scheduled') },
              { value: 'published', label: 'Published', count: count('published') },
              { value: 'draft', label: 'Drafts', count: count('draft') },
            ]} />
            <select className="adm-select" value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Filter by platform">
              <option value="all">All platforms</option>
              {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {shown.length ? (
            <ul className="adm-posts">
              {shown.map((p) => (
                <li key={p.id} className="adm-post">
                  <button type="button" className="adm-post__open" onClick={() => onEdit(p.id)} aria-label={`Edit post: ${excerpt(p).slice(0, 60)}`}>
                    <Thumb item={p.media[0]} className="adm-post__media" />
                    {p.media.length > 1 ? <span className="adm-post__more">+{p.media.length - 1}</span> : null}
                  </button>
                  <div className="adm-post__body">
                    <div className="adm-post__top">
                      <StatusChip status={displayStatus(p)} />
                      <PlatformIcons ids={p.platforms} />
                    </div>
                    <p className="adm-clamp adm-clamp--3">{excerpt(p)}</p>
                    <p className="adm-muted adm-post__when">
                      {p.status === 'scheduled' ? <><CalendarClock size={14} aria-hidden="true" /> {formatDate(p.scheduledAt)}</> : p.status === 'published' ? `Published ${formatDate(p.publishedAt)}` : `Edited ${formatDate(p.updatedAt)}`}
                    </p>
                  </div>
                  <div className="adm-post__actions">
                    <button type="button" className="adm-icon-btn" onClick={() => onEdit(p.id)} aria-label="Edit post" title="Edit"><Pencil size={16} /></button>
                    <button type="button" className="adm-icon-btn" onClick={() => duplicate(p)} aria-label="Duplicate post" title="Duplicate"><Copy size={16} /></button>
                    <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(p)} aria-label="Delete post" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="adm-muted adm-none">No posts match.</p>}
        </>
      ) : (
        <EmptyState icon={Share2} title="No posts yet" text="Compose a post, pick Instagram, TikTok, Snapchat and the rest, then save it, schedule it or publish it." action={<button type="button" className="adm-btn adm-btn--primary" onClick={() => onEdit('new')}><Plus size={16} aria-hidden="true" /> New post</button>} />
      )}
      {confirmUI}
    </>
  )
}

export function SocialEditor({ id, onDone }) {
  const notify = useToast()
  const [confirmUI, confirm] = useConfirm()
  const existing = id === 'new' ? null : posts.get(id)
  const [draft, setDraft] = useState(() => existing ?? EMPTY)
  const [timing, setTiming] = useState(() => (existing?.status === 'scheduled' ? 'schedule' : existing?.status === 'published' ? 'now' : 'draft'))
  const [when, setWhen] = useState(() => toLocalInput(existing?.scheduledAt))
  const [picking, setPicking] = useState(false)
  const [previewOn, setPreviewOn] = useState(null)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)

  if (id !== 'new' && !existing) {
    return <EmptyState icon={Share2} title="Post not found" text="It may have been deleted in another tab." action={<button type="button" className="adm-btn" onClick={onDone}>Back to social media</button>} />
  }

  const set = (patch) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true) }
  const toggle = (pid) => set({ platforms: draft.platforms.includes(pid) ? draft.platforms.filter((x) => x !== pid) : [...draft.platforms, pid] })
  const warnings = postWarnings(draft)
  const strictest = draft.platforms.map(platformById).filter(Boolean).sort((a, b) => a.limit - b.limit)[0]
  const shownPlatform = platformById(draft.platforms.includes(previewOn) ? previewOn : draft.platforms[0])

  const save = async () => {
    setError('')
    if (!draft.caption.trim() && !draft.media.length) return setError('Write a caption or add a photo.')
    if (timing !== 'draft' && !draft.platforms.length) return setError('Choose at least one platform.')
    let scheduledAt = null
    if (timing === 'schedule') {
      if (!when) return setError('Pick a date and time for the post.')
      scheduledAt = new Date(when).toISOString()
      if (new Date(scheduledAt) <= new Date()) return setError('Pick a time in the future.')
    }
    if (timing !== 'draft' && warnings.length && !(await confirm({ title: 'Save with warnings?', message: warnings.join(' '), action: timing === 'now' ? 'Publish anyway' : 'Schedule anyway' }))) return

    const status = timing === 'now' ? 'published' : timing === 'schedule' ? 'scheduled' : 'draft'
    try {
      posts.save({
        ...draft,
        link: draft.link.trim(),
        status,
        scheduledAt,
        publishedAt: status === 'published' ? draft.publishedAt ?? new Date().toISOString() : null,
      })
      setDirty(false)
      notify(status === 'published' ? 'Post marked as published.' : status === 'scheduled' ? `Post scheduled for ${formatDate(scheduledAt)}.` : 'Draft saved.')
      onDone()
    } catch (e) {
      notify(STORAGE_ERRORS[e.message], 'error')
    }
  }

  const back = async () => {
    if (dirty && !(await confirm({ title: 'Leave without saving?', message: 'Your changes to this post will be lost.', action: 'Discard changes', danger: true }))) return
    onDone()
  }

  const remove = async () => {
    if (!(await confirm({ title: 'Delete this post?', message: 'It will be removed for good.', action: 'Delete', danger: true }))) return
    posts.remove(existing.id)
    notify('Post deleted.')
    onDone()
  }

  const actionLabel = timing === 'now' ? 'Publish now' : timing === 'schedule' ? 'Schedule post' : 'Save draft'

  return (
    <>
      <div className="adm-page-head">
        <div>
          <button type="button" className="adm-back" onClick={back}><ArrowLeft size={16} aria-hidden="true" /> All posts</button>
          <h1>{existing ? 'Edit post' : 'New post'}</h1>
        </div>
        <div className="adm-head-actions">
          {existing ? <button type="button" className="adm-btn adm-btn--danger-ghost" onClick={remove}><Trash2 size={16} aria-hidden="true" /> Delete</button> : null}
          <button type="button" className="adm-btn adm-btn--primary" onClick={save}>{timing === 'now' ? <Send size={16} aria-hidden="true" /> : null}{actionLabel}</button>
        </div>
      </div>
      <PreviewBanner />

      <div className="adm-editor">
        <section className="adm-editor__main adm-stack">
          <div className="adm-card">
            <div className="adm-card__row">
              <h2 className="adm-card__title">Post to</h2>
              <button type="button" className="adm-link-btn" onClick={() => set({ platforms: draft.platforms.length === PLATFORMS.length ? [] : PLATFORMS.map((p) => p.id) })}>
                {draft.platforms.length === PLATFORMS.length ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="adm-platform-picker" role="group" aria-label="Platforms">
              {PLATFORMS.map((p) => (
                <button key={p.id} type="button" className="adm-platform-toggle" aria-pressed={draft.platforms.includes(p.id)} onClick={() => toggle(p.id)}>
                  <SocialIcon id={p.id} />{p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="adm-card">
            <div className="field">
              <label className="field__label" htmlFor="post-caption">Caption</label>
              <textarea id="post-caption" className="field__input adm-caption" dir="auto" value={draft.caption} onChange={(e) => set({ caption: e.target.value })} placeholder="Write the caption. Arabic and English both work, and hashtags too." />
            </div>
            {draft.platforms.length ? (
              <ul className="adm-limits">
                {draft.platforms.map(platformById).filter(Boolean).map((p) => {
                  const over = draft.caption.length > p.limit
                  return <li key={p.id} className={over ? 'is-over' : ''}><SocialIcon id={p.id} />{draft.caption.length.toLocaleString()} / {p.limit.toLocaleString()}</li>
                })}
              </ul>
            ) : <p className="adm-hint">{draft.caption.length.toLocaleString()} characters</p>}
            <div className="field adm-mt">
              <label className="field__label" htmlFor="post-link">Link <span className="adm-hint">Optional</span></label>
              <input id="post-link" className="field__input" type="url" dir="ltr" value={draft.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://" />
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card__row">
              <h2 className="adm-card__title">Photos</h2>
              <span className="adm-hint">{draft.media.length} / {MAX_MEDIA}</span>
            </div>
            <ul className="adm-media-grid">
              {draft.media.map((m, i) => (
                <li key={i}>
                  <img src={mediaSrc(m, 480)} alt="" />
                  <button type="button" className="adm-icon-btn adm-media-remove" onClick={() => set({ media: draft.media.filter((_, j) => j !== i) })} aria-label={`Remove photo ${i + 1}`}><X size={14} /></button>
                </li>
              ))}
              {draft.media.length < MAX_MEDIA ? <li><button type="button" className="adm-dropzone adm-dropzone--square" onClick={() => setPicking(true)}><Plus size={20} aria-hidden="true" />Add photo</button></li> : null}
            </ul>
          </div>

          <div className="adm-card">
            <h2 className="adm-card__title">When</h2>
            <Segmented label="When to post" value={timing} onChange={setTiming} options={[
              { value: 'draft', label: 'Keep as draft' },
              { value: 'schedule', label: 'Schedule' },
              { value: 'now', label: 'Publish now' },
            ]} />
            {timing === 'schedule' ? (
              <div className="field adm-mt">
                <label className="field__label" htmlFor="post-when">Date and time</label>
                <input id="post-when" className="field__input" type="datetime-local" value={when} min={toLocalInput(new Date().toISOString())} onChange={(e) => { setWhen(e.target.value); setDirty(true) }} />
              </div>
            ) : null}
            {error ? <p className="field__error adm-mt" role="alert">{error}</p> : null}
          </div>
        </section>

        <aside className="adm-editor__side adm-stack">
          {warnings.length ? (
            <section className="adm-card adm-card--warn">
              <h2 className="adm-card__title"><TriangleAlert size={16} aria-hidden="true" /> Check before posting</h2>
              <ul className="adm-warnings">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
            </section>
          ) : null}
          <section className="adm-card">
            <h2 className="adm-card__title">Preview</h2>
            {shownPlatform ? (
              <>
                {draft.platforms.length > 1 ? (
                  <div className="adm-preview-tabs" role="tablist" aria-label="Preview platform">
                    {draft.platforms.map((pid) => (
                      <button key={pid} type="button" role="tab" aria-selected={shownPlatform.id === pid} onClick={() => setPreviewOn(pid)} title={platformById(pid)?.name}><SocialIcon id={pid} /></button>
                    ))}
                  </div>
                ) : null}
                <div className="adm-preview-post">
                  <p className="adm-preview-post__who"><span className="adm-preview-post__avatar">G</span><strong>GHALIA</strong><span className="adm-muted">{shownPlatform.name}</span></p>
                  {draft.media.length ? <img src={mediaSrc(draft.media[0], 800)} alt="" /> : null}
                  <p className="adm-preview-post__caption" dir="auto">
                    {draft.caption.length > shownPlatform.limit ? <>{draft.caption.slice(0, shownPlatform.limit)}<mark>{draft.caption.slice(shownPlatform.limit)}</mark></> : draft.caption || <span className="adm-muted">Your caption appears here.</span>}
                  </p>
                  {draft.link ? <p className="adm-preview-post__link" dir="ltr">{draft.link}</p> : null}
                </div>
                {strictest ? <p className="adm-hint adm-mt">Shortest limit: {strictest.name}, {strictest.limit.toLocaleString()} characters.</p> : null}
              </>
            ) : <p className="adm-muted">Choose a platform to see a preview.</p>}
          </section>
        </aside>
      </div>
      <MediaPicker open={picking} onClose={() => setPicking(false)} onPick={(m) => { setDirty(true); setDraft((d) => (d.media.length < MAX_MEDIA ? { ...d, media: [...d.media, m] } : d)) }} />
      {confirmUI}
    </>
  )
}
