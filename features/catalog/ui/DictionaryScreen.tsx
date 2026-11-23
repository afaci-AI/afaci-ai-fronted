'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { useAuth } from '@/features/auth'
import { hasPermission } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import { DeleteDialog } from '@/shared/ui/delete-dialog'

import { useDictionary } from '../hooks/useDictionary'
import type { DictionaryEntity, DictionarySpec } from '../model/dictionary-spec'
import { DictionaryFormDrawer } from './dictionary-form-drawer'

interface DictionaryScreenProps<
  T extends DictionaryEntity,
  P,
  R extends object,
> {
  spec: DictionarySpec<T, P, R>
}

/** Единый экран справочника: таблица, форма и удаление по спецификации. */
export function DictionaryScreen<
  T extends DictionaryEntity,
  P,
  R extends object,
>({ spec }: DictionaryScreenProps<T, P, R>) {
  const { user } = useAuth()
  const canEdit = Boolean(
    user && hasPermission(user.role, 'canEditDictionaries'),
  )
  const { items, related, loading, error, saving, save, remove } =
    useDictionary(spec)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<T | null>(null)

  const openForm = (item: T | null) => {
    setSelected(item)
    setDrawerOpen(true)
  }

  const confirmRemove = (item: T) => {
    setSelected(item)
    setDeleteOpen(true)
  }

  const handleSave = async (form: Record<string, string>) => {
    if (await save(selected, form)) {
      setDrawerOpen(false)
      setSelected(null)
    }
  }

  const handleRemove = async () => {
    if (selected && (await remove(selected))) {
      setDeleteOpen(false)
      setSelected(null)
    }
  }

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{spec.title}</CardTitle>
            <CardDescription>{spec.description}</CardDescription>
          </div>
          {canEdit && (
            <Button onClick={() => openForm(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
          <DataTable
            data={items}
            columns={spec.columns(related)}
            filters={spec.filters?.(related)}
            searchPlaceholder={spec.texts.search ?? 'Поиск по названию...'}
            searchKeys={['name']}
            onEdit={canEdit ? openForm : undefined}
            onDelete={canEdit ? confirmRemove : undefined}
            canEdit={canEdit}
            isLoading={loading}
            emptyMessage={spec.texts.empty}
            emptyDescription={spec.texts.emptyHint}
          />
        </CardContent>
      </Card>

      <DictionaryFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={spec.texts.add}
        description={spec.texts.form}
        fields={spec.fields(related)}
        data={selected}
        onSave={handleSave}
        existingValues={
          spec.uniqueName
            ? items.map((item) => item.name.toLowerCase())
            : undefined
        }
        duplicateField={spec.uniqueName ? 'name' : undefined}
        saving={saving}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={selected ? spec.texts.remove(selected) : ''}
        onConfirm={handleRemove}
      />
    </main>
  )
}
