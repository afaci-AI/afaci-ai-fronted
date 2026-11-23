'use client'

import { AppHeader } from '@/app/_shell/app-header'
import {
  DictionaryScreen,
  dictionaryBreadcrumbs,
  nutrientTypeSpec,
} from '@/features/catalog'

export default function NutrientTypesPage() {
  return (
    <>
      <AppHeader breadcrumbs={dictionaryBreadcrumbs(nutrientTypeSpec)} />
      <DictionaryScreen spec={nutrientTypeSpec} />
    </>
  )
}
