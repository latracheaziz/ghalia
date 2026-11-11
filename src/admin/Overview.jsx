import { CalendarClock, FileText, HardDrive, Plus, Share2 } from 'lucide-react'
import { useCollection } from './store'
import { displayStatus } from './Social'
import { formatDate, PlatformIcons, StatusChip, Thumb } from './ui'

// Browsers give each site about 5 MB of localStorage.
const QUOTA = 5 * 1024 * 1024
function storageUsed() {
  try {
    let bytes = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('ghalia.admin.')) bytes += (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2
    }
    return bytes
  } catch {
    return 0
  }
}

export function Overview({ go }) {
  const articles = useCollection('articles')
  const social = useCollection('social')
  const upcoming = social.filter((p) => p.status === 'scheduled').sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)).slice(0, 5)
  const recent = [...articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
  const used = storageUsed()
  const share = Math.min(100, (used / QUOTA) * 100)

  const stats = [
    { label: 'Published articles', value: articles.filter((a) => a.status === 'published').length, icon: FileText, to: 'blog' },
    { label: 'Article drafts', value: articles.filter((a) => a.status === 'draft').length, icon: FileText, to: 'blog' },
    { label: 'Scheduled posts', value: social.filter((p) => p.status === 'scheduled').length, icon: CalendarClock, to: 'social' },
    { label: 'Published posts', value: social.filter((p) => p.status === 'published').length, icon: Share2, to: 'social' },
  ]

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Welcome back</h1>
          <p className="adm-muted">Here is where GHALIA’s stories and posts stand.</p>
        </div>
        <div className="adm-head-actions">
          <button type="button" className="adm-btn" onClick={() => go('blog', 'new')}><Plus size={16} aria-hidden="true" /> New article</button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => go('social', 'new')}><Plus size={16} aria-hidden="true" /> New post</button>
        </div>
      </div>

      <ul className="adm-stats">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <li key={label}>
            <button type="button" className="adm-stat" onClick={() => go(to)}>
              <Icon size={18} aria-hidden="true" />
              <strong>{value}</strong>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="adm-overview">
        <section className="adm-card">
          <div className="adm-card__row">
            <h2 className="adm-card__title">Coming up</h2>
            <button type="button" className="adm-link-btn" onClick={() => go('social')}>All posts</button>
          </div>
          {upcoming.length ? (
            <ul className="adm-mini-list">
              {upcoming.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => go('social', p.id)}>
                    <Thumb item={p.media[0]} />
                    <span className="adm-mini-list__text">
                      <span className="adm-clamp">{p.caption || 'Photo post'}</span>
                      <span className="adm-muted"><PlatformIcons ids={p.platforms} /> {formatDate(p.scheduledAt)}</span>
                    </span>
                    <StatusChip status={displayStatus(p)} />
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="adm-muted">Nothing scheduled. Plan a post for the next collection or celebration.</p>}
        </section>

        <section className="adm-card">
          <div className="adm-card__row">
            <h2 className="adm-card__title">Recent articles</h2>
            <button type="button" className="adm-link-btn" onClick={() => go('blog')}>All articles</button>
          </div>
          {recent.length ? (
            <ul className="adm-mini-list">
              {recent.map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => go('blog', a.id)}>
                    <Thumb item={a.cover} />
                    <span className="adm-mini-list__text">
                      <span className="adm-clamp">{a.title.en || a.title.ar || 'Untitled'}</span>
                      <span className="adm-muted">Edited {formatDate(a.updatedAt)}</span>
                    </span>
                    <StatusChip status={a.status} />
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="adm-muted">No articles yet.</p>}
        </section>

        <section className="adm-card adm-storage">
          <h2 className="adm-card__title"><HardDrive size={16} aria-hidden="true" /> Browser storage</h2>
          <div className="adm-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share)} aria-label="Storage used"><span style={{ inlineSize: `${share}%` }} /></div>
          <p className="adm-muted">{used < 1024 * 1024 ? `${Math.max(1, Math.ceil(used / 1024))} KB` : `${(used / 1024 / 1024).toFixed(1)} MB`} of about 5 MB used. Everything here lives in this browser until the backend is connected: clearing site data, or opening the admin on another device, starts empty. Photos from the site library take no space.</p>
        </section>
      </div>
    </>
  )
}
