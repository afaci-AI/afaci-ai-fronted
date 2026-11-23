'use client'

import { AppHeader } from '@/app/_shell/app-header'
import {
  DictionaryScreen,
  dictionaryBreadcrumbs,
  regionSpec,
} from '@/features/catalog'

export default function RegionsPage() {
  return (
    <>
      <AppHeader breadcrumbs={dictionaryBreadcrumbs(regionSpec)} />
      <DictionaryScreen spec={regionSpec} />
    </>
  )
}
