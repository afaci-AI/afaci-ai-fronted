'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/app-header'
import { DataTable, type Column } from '@/components/data-table'
import { DictionaryFormDrawer, type FormField } from '@/components/dictionary-form-drawer'
import { DeleteDialog } from '@/components/delete-dialog'
import { useAuth } from '@/lib/auth-context'
import { hasPermission } from '@/lib/types'
import { categoriesApi } from '@/lib/api'
import type { Category } from '@/lib/types'

const columns: Column<Category>[] = [
  { key: 'name', label: 'Название', sortable: true },
  { key: 'id', label: 'ID', width: 'text-xs text-muted-foreground' },
]

const formFields: FormField[] = [
  {
    key: 'name',
    label: 'Название',
    type: 'text',
    placeholder: 'Введите название категории',
    required: true,
  },
]

export default function CategoriesPage() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditDictionaries')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      const data = await categoriesApi.list()
      setCategories(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: Category) => {
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const handleDelete = (item: Category) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }

  const handleSave = async (data: Record<string, string>) => {
    if (!data.name) return
    setSaving(true)
    try {
      if (selectedItem) {
        await categoriesApi.update(selectedItem.id, { name: data.name })
      } else {
        await categoriesApi.create({ name: data.name })
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
      await categoriesApi.delete(selectedItem.id)
      await loadData()
      setDeleteOpen(false)
      setSelectedItem(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления')
    } finally {
      setSaving(false)
    }
  }

  const existingNames = categories.map((c) => c.name.toLowerCase())

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Справочники', href: '/dictionaries/categories' },
          { label: 'Категории' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Категории</CardTitle>
              <CardDescription>
                Управление категориями продуктов
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
              data={categories}
              columns={columns}
              searchPlaceholder="Поиск по названию..."
              searchKeys={['name']}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? handleDelete : undefined}
              canEdit={canEdit ?? false}
              loading={loading}
              emptyMessage="Нет категорий"
              emptyDescription="Добавьте первую категорию"
            />
          </CardContent>
        </Card>

        <DictionaryFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={selectedItem ? 'Редактировать категорию' : 'Добавить категорию'}
          description="Заполните информацию о категории"
          fields={formFields}
          data={selectedItem}
          onSave={handleSave}
          existingValues={existingNames}
          duplicateField="name"
          saving={saving}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить категорию "${selectedItem?.name}"?`}
          onConfirm={handleConfirmDelete}
          loading={saving}
        />
      </main>
    </>
  )
}
