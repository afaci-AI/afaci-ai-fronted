'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppHeader } from '@/components/app-header'
import { DataTable, type Column, type Filter } from '@/components/data-table'
import { DeleteDialog } from '@/components/delete-dialog'
import { useAuth } from '@/lib/auth-context'
import { hasPermission } from '@/lib/types'
import { productsApi, categoriesApi, regionsApi } from '@/lib/api'
import type { Product, Category, Region } from '@/lib/types'

export default function ProductsPage() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditProducts')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const [prods, cats, regs] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
        regionsApi.list()
      ])
      setProducts(prods)
      setCategories(cats)
      setRegions(regs)
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

  const columns: Column<Product>[] = [
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      render: (item) => (
        <Link
          href={`/products/${item.id}`}
          className="font-medium text-foreground hover:text-primary hover:underline"
        >
          {item.name}
        </Link>
      ),
    },
    {
      key: 'category_id',
      label: 'Категория',
      render: (item) => {
        const category = categories.find(c => c.id === item.category_id)
        return category ? <Badge variant="secondary">{category.name}</Badge> : '—'
      },
    },
    {
      key: 'region_id',
      label: 'Регион',
      render: (item) => {
        if (!item.region_id) return '—'
        const region = regions.find(r => r.id === item.region_id)
        return region ? <Badge variant="outline">{region.name}</Badge> : '—'
      },
    },
  ]

  const filters: Filter[] = [
    {
      key: 'category_id',
      label: 'Категория',
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      key: 'region_id',
      label: 'Регион',
      options: regions.map((r) => ({ value: r.id, label: r.name })),
    },
  ]

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return
    setDeleting(true)
    try {
      await productsApi.delete(selectedProduct.id)
      await loadData()
      setDeleteOpen(false)
      setSelectedProduct(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Продукты' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Продукты</CardTitle>
              <CardDescription>
                Управление базой данных продуктов и их нутриентов
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Импорт
                </Button>
                <Button asChild>
                  <Link href="/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить продукт
                  </Link>
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
                {error}
              </div>
            )}
            <DataTable
              data={products}
              columns={columns}
              filters={filters}
              searchPlaceholder="Поиск по названию продукта..."
              searchKeys={['name']}
              onEdit={
                canEdit
                  ? (product) => {
                      window.location.href = `/products/${product.id}/edit`
                    }
                  : undefined
              }
              onDelete={canEdit ? handleDelete : undefined}
              canEdit={canEdit ?? false}
              loading={loading}
              emptyMessage="Нет продуктов"
              emptyDescription="Добавьте первый продукт в базу данных"
            />
          </CardContent>
        </Card>

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить продукт "${selectedProduct?.name}"?`}
          description="Все связанные нутриенты также будут удалены. Это действие нельзя отменить."
          onConfirm={handleConfirmDelete}
          loading={deleting}
        />
      </main>
    </>
  )
}

