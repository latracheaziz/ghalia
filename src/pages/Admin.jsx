import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ExternalLink, FileText, LayoutDashboard, LogOut, Share2 } from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Wordmark } from '../components/brand/Logo'
import { TLink } from '../components/ui/TLink'
import { currentSession, signOut } from '../admin/auth'
import { Login } from '../admin/Login'
import { Overview } from '../admin/Overview'
import { BlogEditor, BlogList } from '../admin/Blog'
import { SocialEditor, SocialList } from '../admin/Social'
import { ToastProvider } from '../admin/ui'
import '../styles/admin.css'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'social', label: 'Social media', icon: Share2 },
]

/** The Maison's admin: reached by clicking the GHALIA wordmark five times on the home page, or at /admin. */
export default function Admin() {
  const [session, setSession] = useState(currentSession)
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview'
  const edit = params.get('edit')

  // Keep the admin out of search engines.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.append(meta)
    return () => meta.remove()
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [tab, edit])

  const go = (nextTab, editId) => setParams(editId ? { tab: nextTab, edit: editId } : nextTab === 'overview' ? {} : { tab: nextTab })
  const leave = () => {
    signOut()
    setSession(null)
    setParams({})
  }

  if (!session) {
    return (
      <Page title="Admin">
        <div className="adm" dir="ltr" lang="en"><Login onSignedIn={() => setSession(currentSession())} /></div>
      </Page>
    )
  }

  const back = () => go(tab)
  let screen = <Overview go={go} />
  if (tab === 'blog') screen = edit ? <BlogEditor key={edit} id={edit} onDone={back} /> : <BlogList onEdit={(id) => go('blog', id)} />
  if (tab === 'social') screen = edit ? <SocialEditor key={edit} id={edit} onDone={back} /> : <SocialList onEdit={(id) => go('social', id)} />

  return (
    <Page title="Admin">
      <ToastProvider>
        <div className="adm adm-shell" dir="ltr" lang="en" data-theme="paper">
          <aside className="adm-side" data-theme="deep">
            <Wordmark className="adm-side__mark" />
            <p className="adm-side__label">Admin</p>
            <nav className="adm-nav" aria-label="Admin">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" className="adm-nav__item" aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
                  <Icon size={18} aria-hidden="true" />{label}
                </button>
              ))}
            </nav>
            <div className="adm-side__foot">
              <p className="adm-side__who">{session.email}</p>
              <TLink to="/" className="adm-nav__item adm-nav__item--quiet"><ExternalLink size={16} aria-hidden="true" /><span className="adm-nav__text">View the site</span></TLink>
              <button type="button" className="adm-nav__item adm-nav__item--quiet" onClick={leave}><LogOut size={16} aria-hidden="true" /><span className="adm-nav__text">Sign out</span></button>
            </div>
          </aside>
          <div className="adm-main">{screen}</div>
        </div>
      </ToastProvider>
    </Page>
  )
}
