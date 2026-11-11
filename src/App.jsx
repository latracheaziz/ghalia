import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useLang } from './state/LangContext'
import { ui } from './content/ui'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Preloader } from './components/layout/Preloader'
import { Cursor } from './components/layout/Cursor'
import { ErrorBoundary } from './components/layout/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Maison = lazy(() => import('./pages/Maison'))
const Atelier = lazy(() => import('./pages/Atelier'))
const Collections = lazy(() => import('./pages/Collections'))
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'))
const Weddings = lazy(() => import('./pages/Weddings'))
const Studio = lazy(() => import('./pages/Studio'))
const Corporate = lazy(() => import('./pages/Corporate'))
const Order = lazy(() => import('./pages/Order'))
const Contact = lazy(() => import('./pages/Contact'))
const Inbox = lazy(() => import('./pages/Inbox'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

const NO_FOOTER = ['/studio', '/inbox']

export default function App() {
  const { lang, t } = useLang()
  const { pathname } = useLocation()
  // The admin is a working tool: no site header, footer or gold cursor.
  const admin = pathname.startsWith('/admin')

  return (
    <>
      <a className="skip-link" href="#main">{t(ui.skip)}</a>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          {/* The pointed arch from the Arabian Heritage and Eid packaging */}
          <clipPath id="ogee" clipPathUnits="objectBoundingBox">
            <path d="M0 1V.4C0 .3.3.2.5 0 .7.2 1 .3 1 .4V1Z" />
          </clipPath>
        </defs>
      </svg>
      <Preloader />
      {admin ? null : <Cursor />}
      {admin ? null : <Header />}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Routes key={lang}>
            <Route path="/" element={<Home />} />
            <Route path="/maison" element={<Maison />} />
            <Route path="/atelier" element={<Atelier />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:slug" element={<CollectionDetail />} />
            <Route path="/weddings" element={<Weddings />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/corporate" element={<Corporate />} />
            <Route path="/order" element={<Order />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {admin || NO_FOOTER.includes(pathname) ? null : <Footer />}
    </>
  )
}
