'use client'

import { AppHeader } from '@/app/_shell/app-header'
import {
  DictionaryScreen,
  dictionaryBreadcrumbs,
  unitSpec,
} from '@/features/catalog'

export default function UnitsPage() {
  return (
    <>
      <AppHeader breadcrumbs={dictionaryBreadcrumbs(unitSpec)} />
      <DictionaryScreen spec={unitSpec} />
    </>
  )
}
