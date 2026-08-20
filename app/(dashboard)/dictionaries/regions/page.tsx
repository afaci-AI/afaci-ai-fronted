'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/app-header'
import { DataTable, type Column } from '@/components/data-table'
import { DictionaryFormDrawer, type FormField } from '@/components/dictionary-form-drawer'
import { DeleteDialog } from '@/components/delete-dialog'
import { useAuth } from '@/lib/auth-context'
import { hasPermission } from '@/lib/types'
import { regionsApi } from '@/lib/api'
import type { Region } from '@/lib/types'

export default function RegionsPage() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditDictionaries')

  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Region | null>(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const data = await regionsApi.list()
      setRegions(data)
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

  const columns: Column<Region>[] = [
    { key: 'name', label: 'Название', sortable: true },
    { key: 'id', label: 'ID', width: 'text-xs text-muted-foreground' },
  ]

  const formFields: FormField[] = [
    {
      key: 'name',
      label: 'Название',
      type: 'text',
      placeholder: 'Введите название региона',
      required: true,
    },
  ]

  const handleEdit = (item: Region) => {
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const handleDelete = (item: Region) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }

  const handleSave = async (data: Record<string, string>) => {
    if (!data.name) return
    setSaving(true)
    try {
      if (selectedItem) {
        await regionsApi.update(selectedItem.id, { name: data.name })
      } else {
        await regionsApi.create({ name: data.name })
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
      await regionsApi.delete(selectedItem.id)
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
          { label: 'Регионы' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Регионы</CardTitle>
              <CardDescription>
                Управление регионами происхождения продуктов
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
              data={regions}
              columns={columns}
              searchPlaceholder="Поиск по названию..."
              searchKeys={['name']}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? handleDelete : undefined}
              canEdit={canEdit ?? false}
              loading={loading}
              emptyMessage="Нет регионов"
              emptyDescription="Добавьте первый регион"
            />
          </CardContent>
        </Card>

        <DictionaryFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={selectedItem ? 'Редактировать регион' : 'Добавить регион'}
          description="Заполните информацию о регионе"
          fields={formFields}
          data={selectedItem}
          onSave={handleSave}
          saving={saving}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить регион "${selectedItem?.name}"?`}
          onConfirm={handleConfirmDelete}
          loading={saving}
        />
      </main>
    </>
  )
}
