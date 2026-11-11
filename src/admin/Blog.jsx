import { useMemo, useState } from 'react'
import { ArrowLeft, Copy, Eye, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { collection, STORAGE_ERRORS, useCollection } from './store'
import { mediaSrc } from './media'
import { EmptyState, formatDate, MediaPicker, Modal, Segmented, StatusChip, Thumb, useConfirm, useToast } from './ui'

const articles = collection('articles')
const LANGS = [{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]
const CATEGORIES = ['News', 'Collections', 'Celebrations', 'Weddings', 'Gifting', 'Behind the scenes']
const EMPTY = { title: { en: '', ar: '' }, excerpt: { en: '', ar: '' }, body: { en: '', ar: '' }, slug: '', category: '', tags: [], cover: null, status: 'draft', publishedAt: null }

const slugify = (text) => text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
const titleOf = (a) => a.title.en || a.title.ar || 'Untitled'

export function BlogList({ onEdit }) {
  const all = useCollection('articles')
  const notify = useToast()
  const [confirmUI, confirm] = useConfirm()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...all]
      .filter((a) => status === 'all' || a.status === status)
      .filter((a) => !q || [a.title.en, a.title.ar, a.excerpt.en, a.excerpt.ar, a.category, ...a.tags].join(' ').toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [all, query, status])

  const duplicate = (a) => {
    try {
      const { id, createdAt, updatedAt, ...rest } = a
      articles.save({ ...rest, title: { en: a.title.en && `${a.title.en} (copy)`, ar: a.title.ar && `${a.title.ar} (نسخة)` }, slug: `${a.slug}-copy`, status: 'draft', publishedAt: null })
      notify('Article duplicated as a draft.')
    } catch (e) { notify(STORAGE_ERRORS[e.message], 'error') }
  }

  const remove = async (a) => {
    if (!(await confirm({ title: 'Delete this article?', message: `“${titleOf(a)}” will be removed for good.`, action: 'Delete', danger: true }))) return
    articles.remove(a.id)
    notify('Article deleted.')
  }

  const count = (s) => all.filter((a) => s === 'all' || a.status === s).length

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Blog</h1>
          <p className="adm-muted">Articles in English and Arabic.</p>
        </div>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => onEdit('new')}><Plus size={16} aria-hidden="true" /> New article</button>
      </div>

      {all.length ? (
        <>
          <div className="adm-toolbar">
            <label className="adm-search">
              <Search size={16} aria-hidden="true" />
              <input type="search" placeholder="Search articles" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search articles" />
            </label>
            <Segmented label="Filter by status" value={status} onChange={setStatus} options={[
              { value: 'all', label: 'All', count: count('all') },
              { value: 'published', label: 'Published', count: count('published') },
              { value: 'draft', label: 'Drafts', count: count('draft') },
            ]} />
          </div>
          {shown.length ? (
            <ul className="adm-rows">
              {shown.map((a) => (
                <li key={a.id} className="adm-row">
                  <button type="button" className="adm-row__main" onClick={() => onEdit(a.id)}>
                    <Thumb item={a.cover} />
                    <span className="adm-row__text">
                      <strong>{titleOf(a)}</strong>
                      <span className="adm-muted adm-clamp">{a.excerpt.en || a.excerpt.ar || 'No summary yet.'}</span>
                    </span>
                  </button>
                  <span className="adm-row__meta">
                    <StatusChip status={a.status} />
                    <span className="adm-muted">{a.status === 'published' ? formatDate(a.publishedAt, false) : `Edited ${formatDate(a.updatedAt)}`}</span>
                    <span className="adm-langs">{a.title.en ? <abbr title="English version">EN</abbr> : null}{a.title.ar ? <abbr title="Arabic version">AR</abbr> : null}</span>
                  </span>
                  <span className="adm-row__actions">
                    <button type="button" className="adm-icon-btn" onClick={() => onEdit(a.id)} aria-label={`Edit ${titleOf(a)}`} title="Edit"><Pencil size={16} /></button>
                    <button type="button" className="adm-icon-btn" onClick={() => duplicate(a)} aria-label={`Duplicate ${titleOf(a)}`} title="Duplicate"><Copy size={16} /></button>
                    <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(a)} aria-label={`Delete ${titleOf(a)}`} title="Delete"><Trash2 size={16} /></button>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="adm-muted adm-none">No articles match.</p>}
        </>
      ) : (
        <EmptyState icon={FileText} title="No articles yet" text="Write the first story: a new collection, a celebration, or the craft behind a box." action={<button type="button" className="adm-btn adm-btn--primary" onClick={() => onEdit('new')}><Plus size={16} aria-hidden="true" /> New article</button>} />
      )}
      {confirmUI}
    </>
  )
}

export function BlogEditor({ id, onDone }) {
  const notify = useToast()
  const [confirmUI, confirm] = useConfirm()
  const existing = id === 'new' ? null : articles.get(id)
  const [draft, setDraft] = useState(() => existing ?? EMPTY)
  const [lang, setLang] = useState('en')
  const [slugTouched, setSlugTouched] = useState(Boolean(existing?.slug))
  const [errors, setErrors] = useState({})
  const [picking, setPicking] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [tagsText, setTagsText] = useState(() => draft.tags.join(', '))

  if (id !== 'new' && !existing) {
    return <EmptyState icon={FileText} title="Article not found" text="It may have been deleted in another tab." action={<button type="button" className="adm-btn" onClick={onDone}>Back to the blog</button>} />
  }

  const set = (patch) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true) }
  const setText = (field, value) => {
    const next = { ...draft[field], [lang]: value }
    const patch = { [field]: next }
    if (field === 'title' && lang === 'en' && !slugTouched) patch.slug = slugify(value)
    set(patch)
  }

  const save = (status) => {
    const problems = {}
    if (!draft.title.en.trim() && !draft.title.ar.trim()) problems.title = 'Give the article a title in at least one language.'
    const slug = draft.slug || slugify(draft.title.en) || `article-${Date.now().toString(36)}`
    if (articles.all().some((a) => a.slug === slug && a.id !== existing?.id)) problems.slug = 'Another article already uses this web address.'
    if (status === 'published' && !draft.body.en.trim() && !draft.body.ar.trim()) problems.body = 'An article needs some text before it is published.'
    setErrors(problems)
    if (Object.keys(problems).length) {
      if (problems.title || problems.body) setLang(draft.title.en || !draft.title.ar ? 'en' : 'ar')
      return
    }
    try {
      const saved = articles.save({
        ...draft,
        slug,
        status,
        publishedAt: status === 'published' ? draft.publishedAt ?? new Date().toISOString() : draft.publishedAt,
      })
      setDraft(saved)
      setDirty(false)
      notify(status === 'published' ? (existing?.status === 'published' ? 'Article updated.' : 'Article published.') : 'Draft saved.')
      onDone()
    } catch (e) {
      notify(STORAGE_ERRORS[e.message], 'error')
    }
  }

  const back = async () => {
    if (dirty && !(await confirm({ title: 'Leave without saving?', message: 'Your changes to this article will be lost.', action: 'Discard changes', danger: true }))) return
    onDone()
  }

  const remove = async () => {
    if (!(await confirm({ title: 'Delete this article?', message: `“${titleOf(draft)}” will be removed for good.`, action: 'Delete', danger: true }))) return
    articles.remove(existing.id)
    notify('Article deleted.')
    onDone()
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const published = draft.status === 'published'

  return (
    <>
      <div className="adm-page-head">
        <div>
          <button type="button" className="adm-back" onClick={back}><ArrowLeft size={16} aria-hidden="true" /> All articles</button>
          <h1>{existing ? 'Edit article' : 'New article'}</h1>
        </div>
        <div className="adm-head-actions">
          <button type="button" className="adm-btn" onClick={() => setPreviewing(true)}><Eye size={16} aria-hidden="true" /> Preview</button>
          <button type="button" className="adm-btn" onClick={() => save('draft')}>{published ? 'Unpublish' : 'Save draft'}</button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => save('published')}>{published ? 'Update' : 'Publish'}</button>
        </div>
      </div>

      <div className="adm-editor">
        <section className="adm-card adm-editor__main">
          <Segmented label="Language" value={lang} onChange={setLang} options={LANGS.map((l) => ({ ...l, label: `${l.label}${draft.title[l.value] ? ' ✓' : ''}` }))} />
          <div className={`field ${errors.title ? 'field--invalid' : ''}`}>
            <label className="field__label" htmlFor="art-title">Title</label>
            <input id="art-title" className="field__input adm-title-input" dir={dir} value={draft.title[lang]} onChange={(e) => setText('title', e.target.value)} placeholder={lang === 'ar' ? 'عنوان المقال' : 'Article title'} />
            {errors.title ? <p className="field__error">{errors.title}</p> : null}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="art-excerpt">Summary <span className="adm-hint">{draft.excerpt[lang].length}/220</span></label>
            <textarea id="art-excerpt" className="field__input" dir={dir} rows={2} maxLength={220} value={draft.excerpt[lang]} onChange={(e) => setText('excerpt', e.target.value)} placeholder={lang === 'ar' ? 'سطر أو سطران يظهران في قائمة المقالات' : 'One or two lines shown in the article list'} />
          </div>
          <div className={`field ${errors.body ? 'field--invalid' : ''}`}>
            <label className="field__label" htmlFor="art-body">Article <span className="adm-hint">Leave an empty line between paragraphs</span></label>
            <textarea id="art-body" className="field__input adm-body-input" dir={dir} value={draft.body[lang]} onChange={(e) => setText('body', e.target.value)} />
            {errors.body ? <p className="field__error">{errors.body}</p> : null}
          </div>
        </section>

        <aside className="adm-editor__side">
          <section className="adm-card">
            <h2 className="adm-card__title">Status</h2>
            <p className="adm-status-line"><StatusChip status={draft.status} />{published ? <span className="adm-muted">since {formatDate(draft.publishedAt, false)}</span> : <span className="adm-muted">Only visible here</span>}</p>
            {existing ? <button type="button" className="adm-btn adm-btn--danger-ghost adm-btn--block" onClick={remove}><Trash2 size={16} aria-hidden="true" /> Delete article</button> : null}
          </section>

          <section className="adm-card">
            <h2 className="adm-card__title">Cover photo</h2>
            {draft.cover ? (
              <div className="adm-cover">
                <img src={mediaSrc(draft.cover, 800)} alt="" />
                <div className="adm-cover__actions">
                  <button type="button" className="adm-btn adm-btn--sm" onClick={() => setPicking(true)}>Change</button>
                  <button type="button" className="adm-btn adm-btn--sm" onClick={() => set({ cover: null })}>Remove</button>
                </div>
              </div>
            ) : <button type="button" className="adm-dropzone" onClick={() => setPicking(true)}>Add a cover photo</button>}
          </section>

          <section className="adm-card adm-stack">
            <h2 className="adm-card__title">Details</h2>
            <div className={`field ${errors.slug ? 'field--invalid' : ''}`}>
              <label className="field__label" htmlFor="art-slug">Web address</label>
              <div className="adm-prefixed"><span>/blog/</span><input id="art-slug" className="field__input" dir="ltr" value={draft.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }) }} placeholder="our-new-collection" /></div>
              {errors.slug ? <p className="field__error">{errors.slug}</p> : null}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="art-category">Category</label>
              <input id="art-category" className="field__input" list="art-categories" value={draft.category} onChange={(e) => set({ category: e.target.value })} />
              <datalist id="art-categories">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="art-tags">Tags <span className="adm-hint">Separate with commas</span></label>
              <input id="art-tags" className="field__input" value={tagsText} onChange={(e) => { setTagsText(e.target.value); set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }) }} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="art-date">Publish date</label>
              <input id="art-date" className="field__input" type="date" value={draft.publishedAt ? draft.publishedAt.slice(0, 10) : ''} onChange={(e) => set({ publishedAt: e.target.value ? new Date(`${e.target.value}T09:00:00`).toISOString() : null })} />
            </div>
          </section>
        </aside>
      </div>

      <MediaPicker open={picking} onClose={() => setPicking(false)} onPick={(cover) => set({ cover })} />
      <Modal open={previewing} onClose={() => setPreviewing(false)} title={`Preview (${lang === 'ar' ? 'Arabic' : 'English'})`} size="lg">
        <article className="adm-preview-article" dir={dir} lang={lang}>
          {draft.cover ? <img src={mediaSrc(draft.cover, 1200)} alt="" /> : null}
          {draft.category ? <p className="eyebrow eyebrow--plain">{draft.category}</p> : null}
          <h1 className="display">{draft.title[lang] || (lang === 'ar' ? 'بدون عنوان' : 'Untitled')}</h1>
          {draft.excerpt[lang] ? <p className="t-lead">{draft.excerpt[lang]}</p> : null}
          {draft.body[lang].split(/\n\s*\n/).filter((p) => p.trim()).map((p, i) => <p key={i}>{p}</p>)}
        </article>
      </Modal>
      {confirmUI}
    </>
  )
}
