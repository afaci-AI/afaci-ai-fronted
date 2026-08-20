'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/app-header'
import { DataTable, type Column } from '@/components/data-table'
import {
  DictionaryFormDrawer,
  type FormField,
} from '@/components/dictionary-form-drawer'
import { DeleteDialog } from '@/components/delete-dialog'
import { useAuth } from '@/lib/auth-context'
import { hasPermission } from '@/lib/types'
import { unitsApi } from '@/lib/api'
import type { Unit } from '@/lib/types'

export default function UnitsPage() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditDictionaries')

  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Unit | null>(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const data = await unitsApi.list()
      setUnits(data)
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

  const columns: Column<Unit>[] = [
    { key: 'name', label: 'Название', sortable: true },
    { key: 'id', label: 'ID', className: 'text-xs text-muted-foreground' },
  ]

  const formFields: FormField[] = [
    {
      key: 'name',
      label: 'Название',
      type: 'text',
      placeholder: 'Например: Грамм',
      required: true,
    },
  ]

  const handleEdit = (item: Unit) => {
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const handleDelete = (item: Unit) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }

  const handleSave = async (data: Record<string, string>) => {
    if (!data.name) return
    setSaving(true)
    try {
      if (selectedItem) {
        await unitsApi.update(selectedItem.id, { name: data.name })
      } else {
        await unitsApi.create({ name: data.name })
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
      await unitsApi.delete(selectedItem.id)
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
          { label: 'Единицы измерения' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Единицы измерения</CardTitle>
              <CardDescription>
                Управление единицами измерения для нутриентов
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
              data={units}
              columns={columns}
              searchPlaceholder="Поиск по названию..."
              searchKeys={['name']}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? handleDelete : undefined}
              canEdit={canEdit ?? false}
              isLoading={loading}
              emptyMessage="Нет единиц измерения"
              emptyDescription="Добавьте первую единицу"
            />
          </CardContent>
        </Card>

        <DictionaryFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={
            selectedItem
              ? 'Редактировать единицу'
              : 'Добавить единицу измерения'
          }
          description="Заполните информацию о единице"
          fields={formFields}
          data={selectedItem}
          onSave={handleSave}
          saving={saving}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить единицу "${selectedItem?.name}"?`}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </>
  )
}
