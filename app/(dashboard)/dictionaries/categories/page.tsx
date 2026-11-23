'use client'

import { AppHeader } from '@/app/_shell/app-header'
import {
  DictionaryScreen,
  dictionaryBreadcrumbs,
  categorySpec,
} from '@/features/catalog'

export default function CategoriesPage() {
  return (
    <>
      <AppHeader breadcrumbs={dictionaryBreadcrumbs(categorySpec)} />
      <DictionaryScreen spec={categorySpec} />
    </>
  )
}
