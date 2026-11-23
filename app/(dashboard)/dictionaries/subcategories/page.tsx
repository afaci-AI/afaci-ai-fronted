'use client'

import { AppHeader } from '@/app/_shell/app-header'
import {
  DictionaryScreen,
  dictionaryBreadcrumbs,
  subcategorySpec,
} from '@/features/catalog'

export default function SubcategoriesPage() {
  return (
    <>
      <AppHeader breadcrumbs={dictionaryBreadcrumbs(subcategorySpec)} />
      <DictionaryScreen spec={subcategorySpec} />
    </>
  )
}
