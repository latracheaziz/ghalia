import { Page } from '../components/layout/Page'
import { Film } from '../components/home/Film'
import { Expertise } from '../components/home/Expertise'
import { CollectionsReel } from '../components/home/CollectionsReel'
import { Celebrations } from '../components/home/Celebrations'
import { PromiseStatement } from '../components/home/PromiseStatement'
import { Doors } from '../components/home/Doors'
import { ChapterRail } from '../components/home/ChapterRail'
import { useLang } from '../state/LangContext'
import { home } from '../content/home'

export default function Home() {
  const { t } = useLang()
  return (
    <Page description={t(home.meta)}>
      <Film />
      <Expertise />
      <CollectionsReel />
      <Celebrations />
      <PromiseStatement />
      <Doors />
      <ChapterRail />
    </Page>
  )
}
