'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { AppHeader } from '@/app/_shell/app-header'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { DictionaryFormDrawer, type FormField } from '@/features/catalog'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { useAuth } from '@/features/auth'
import { hasPermission } from '@/shared/api/types'
import { nutrientTypesApi } from '@/features/catalog'
import type { NutrientType } from '@/shared/api/types'

export default function NutrientTypesPage() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditDictionaries')

  const [nutrientTypes, setNutrientTypes] = useState<NutrientType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NutrientType | null>(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const data = await nutrientTypesApi.list()
      setNutrientTypes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await loadData()
    })()
  }, [loadData])

  const columns: Column<NutrientType>[] = [
    { key: 'name', label: 'Название', sortable: true },
  ]

  const formFields: FormField[] = [
    {
      key: 'name',
      label: 'Название',
      type: 'text',
      placeholder: 'Введите название типа',
      required: true,
    },
  ]

  const handleEdit = (item: NutrientType) => {
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const handleDelete = (item: NutrientType) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }

  const handleSave = async (data: Record<string, string>) => {
    if (!data.name) return
    setSaving(true)
    try {
      if (selectedItem) {
        await nutrientTypesApi.update(selectedItem.id, { name: data.name })
      } else {
        await nutrientTypesApi.create({ name: data.name })
      }
      await loadData()
      setDrawerOpen(false)
      setSelectedItem(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      await nutrientTypesApi.delete(selectedItem.id)
      await loadData()
      setDeleteOpen(false)
      setSelectedItem(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Справочники', href: '/dictionaries/categories' },
          { label: 'Типы нутриентов' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Типы нутриентов</CardTitle>
              <CardDescription>
                Управление типами нутриентов (макронутриенты, витамины, минералы
                и т.д.)
              </CardDescription>
            </div>
            {canEdit && (
              <Button
                onClick={() => {
                  setSelectedItem(null)
                  setDrawerOpen(true)
                }}
              >
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
              data={nutrientTypes}
              columns={columns}
              searchPlaceholder="Поиск по названию..."
              searchKeys={['name']}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? handleDelete : undefined}
              canEdit={canEdit ?? false}
              isLoading={loading}
              emptyMessage="Нет типов нутриентов"
              emptyDescription="Добавьте первый тип"
            />
          </CardContent>
        </Card>

        <DictionaryFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={selectedItem ? 'Редактировать тип' : 'Добавить тип нутриента'}
          description="Заполните информацию о типе"
          fields={formFields}
          data={selectedItem}
          onSave={handleSave}
          saving={saving}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить тип "${selectedItem?.name}"?`}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </>
  )
}
