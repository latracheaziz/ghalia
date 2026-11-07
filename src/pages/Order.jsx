import { Page } from '../components/layout/Page'
import { Configurator } from '../components/configurator/Configurator'
import { useLang } from '../state/LangContext'
import { ui } from '../content/ui'

/** A showcase, not a shop: visitors compose a gift here and send it to the Maison on WhatsApp. */
export default function Order() {
  const { t } = useLang()
  return (
    <Page title={t(ui.orderTitle)} description={t(ui.orderIntro)}>
      <Configurator />
    </Page>
  )
}
