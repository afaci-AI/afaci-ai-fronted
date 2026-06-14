'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppHeader } from '@/components/app-header'
import { DataTable, type Column, type Filter } from '@/components/data-table'
import { DictionaryFormDrawer, type FormField } from '@/components/dictionary-form-drawer'
import { DeleteDialog } from '@/components/delete-dialog'
import { useAuth } from '@/lib/auth-context'
import { hasPermission } from '@/lib/types'
import { nutrientNamesApi, nutrientTypesApi } from '@/lib/api'
import type { NutrientName, NutrientType } from '@/lib/types'

export default function NutrientNamesPage() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditDictionaries')

  const [nutrientNames, setNutrientNames] = useState<NutrientName[]>([])
  const [nutrientTypes, setNutrientTypes] = useState<NutrientType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NutrientName | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      const [names, types] = await Promise.all([
        nutrientNamesApi.list(),
        nutrientTypesApi.list()
      ])
      setNutrientNames(names)
      setNutrientTypes(types)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<NutrientName>[] = [
    { key: 'name', label: 'Название', sortable: true },
    {
      key: 'nutrient_type_id',
      label: 'Тип',
      render: (item) => {
        const type = nutrientTypes.find(t => t.id === item.nutrient_type_id)
        return type ? <Badge variant="secondary">{type.name}</Badge> : '—'
      },
    },
  ]

  const filters: Filter[] = [
    {
      key: 'nutrient_type_id',
      label: 'Тип нутриента',
      options: nutrientTypes.map((t) => ({ value: t.id, label: t.name })),
    },
  ]

  const formFields: FormField[] = [
    {
      key: 'name',
      label: 'Название',
      type: 'text',
      placeholder: 'Введите название нутриента',
      required: true,
    },
    {
      key: 'nutrient_type_id',
      label: 'Тип нутриента',
      type: 'select',
      placeholder: 'Выберите тип',
      required: true,
      options: nutrientTypes.map((t) => ({ value: t.id, label: t.name })),
    },
  ]

  const handleEdit = (item: NutrientName) => {
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const handleDelete = (item: NutrientName) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }

  const handleSave = async (data: Record<string, string>) => {
    if (!data.name || !data.nutrient_type_id) return
    setSaving(true)
    try {
      if (selectedItem) {
        await nutrientNamesApi.update(selectedItem.id, { name: data.name })
      } else {
        await nutrientNamesApi.create({ name: data.name })
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
      await nutrientNamesApi.delete(selectedItem.id)
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
          { label: 'Названия нутриентов' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Названия нутриентов</CardTitle>
              <CardDescription>
                Управление нутриентами (белки, витамины, минералы и т.д.)
              </CardDescription>
            </div>
            {canEdit && (
              <Button onClick={() => { setSelectedItem(null); setDrawerOpen(true); }}>
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
              data={nutrientNames}
              columns={columns}
              filters={filters}
              searchPlaceholder="Поиск по названию..."
              searchKeys={['name']}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? handleDelete : undefined}
              canEdit={canEdit ?? false}
              loading={loading}
              emptyMessage="Нет нутриентов"
              emptyDescription="Добавьте первый нутриент"
            />
          </CardContent>
        </Card>

        <DictionaryFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={selectedItem ? 'Редактировать нутриент' : 'Добавить нутриент'}
          description="Заполните информацию о нутриенте"
          fields={formFields}
          data={selectedItem}
          onSave={handleSave}
          saving={saving}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить нутриент "${selectedItem?.name}"?`}
          onConfirm={handleConfirmDelete}
          loading={saving}
        />
      </main>
    </>
  )
}
