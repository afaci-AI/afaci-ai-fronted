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
import { subcategoriesApi, categoriesApi } from '@/lib/api'
import type { Subcategory, Category } from '@/lib/types'

export default function SubcategoriesPage() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditDictionaries')

  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Subcategory | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      const [subcats, cats] = await Promise.all([
        subcategoriesApi.list(),
        categoriesApi.list()
      ])
      setSubcategories(subcats)
      setCategories(cats)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<Subcategory>[] = [
    { key: 'name', label: 'Название', sortable: true },
    {
      key: 'category_id',
      label: 'Категория',
      render: (item) => {
        const category = categories.find(c => c.id === item.category_id)
        return category ? <Badge variant="secondary">{category.name}</Badge> : '—'
      },
    },
  ]

  const filters: Filter[] = [
    {
      key: 'category_id',
      label: 'Категория',
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
  ]

  const formFields: FormField[] = [
    {
      key: 'name',
      label: 'Название',
      type: 'text',
      placeholder: 'Введите название подкатегории',
      required: true,
    },
    {
      key: 'category_id',
      label: 'Категория',
      type: 'select',
      placeholder: 'Выберите категорию',
      required: true,
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
  ]

  const handleEdit = (item: Subcategory) => {
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const handleDelete = (item: Subcategory) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }

  const handleSave = async (data: Record<string, string>) => {
    if (!data.name || !data.category_id) return
    setSaving(true)
    try {
      if (selectedItem) {
        await subcategoriesApi.update(selectedItem.id, { name: data.name })
      } else {
        await subcategoriesApi.create({ name: data.name })
      }
      await loadData()
      setDrawerOpen(false)
      setSelectedItem(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Оши��ка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      await subcategoriesApi.delete(selectedItem.id)
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
          { label: 'Подкатегории' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Подкатегории</CardTitle>
              <CardDescription>
                Управление подкатегориями продуктов
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
              data={subcategories}
              columns={columns}
              filters={filters}
              searchPlaceholder="Поиск по названию..."
              searchKeys={['name']}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? handleDelete : undefined}
              canEdit={canEdit ?? false}
              loading={loading}
              emptyMessage="Нет подкатегорий"
              emptyDescription="Добавьте первую подкатегорию"
            />
          </CardContent>
        </Card>

        <DictionaryFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={selectedItem ? 'Редактировать подкатегорию' : 'Добавить подкатегорию'}
          description="Заполните информацию о подкатегории"
          fields={formFields}
          data={selectedItem}
          onSave={handleSave}
          saving={saving}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить подкатегорию "${selectedItem?.name}"?`}
          onConfirm={handleConfirmDelete}
          loading={saving}
        />
      </main>
    </>
  )
}
