import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { useLang } from '../state/LangContext'
import { ui } from '../content/ui'

export default function NotFound() {
  const { t } = useLang()
  return (
    <Page title="404">
      <section className="section wrap lost" data-theme="deep" data-tone="light">
        <p className="display t-mega" aria-hidden="true">404</p>
        <h1 className="display t-sub">{t(ui.notFound)}</h1>
        <div className="actions"><Button to="/">{t(ui.home)}</Button></div>
      </section>
    </Page>
  )
}
