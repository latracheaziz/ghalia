import { Page } from '../components/layout/Page'
import { Film } from '../components/home/Film'
import { World } from '../components/home/World'
import { Doors } from '../components/home/Doors'
import { CollectionsReel } from '../components/home/CollectionsReel'
import { Celebrations } from '../components/home/Celebrations'
import { ContactBand } from '../components/home/ContactBand'
import { ChapterRail } from '../components/home/ChapterRail'
import { useLang } from '../state/LangContext'
import { home } from '../content/home'

export default function Home() {
  const { t } = useLang()
  return (
    <Page description={t(home.meta)}>
      <Film />
      <World />
      <Doors />
      <CollectionsReel />
      <Celebrations />
      <ContactBand />
      <ChapterRail />
    </Page>
  )
}
