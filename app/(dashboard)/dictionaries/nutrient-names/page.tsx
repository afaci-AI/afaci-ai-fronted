'use client'

import { AppHeader } from '@/app/_shell/app-header'
import {
  DictionaryScreen,
  dictionaryBreadcrumbs,
  nutrientNameSpec,
} from '@/features/catalog'

export default function NutrientNamesPage() {
  return (
    <>
      <AppHeader breadcrumbs={dictionaryBreadcrumbs(nutrientNameSpec)} />
      <DictionaryScreen spec={nutrientNameSpec} />
    </>
  )
}
