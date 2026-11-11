'use client'

import Link from 'next/link'
import { Package, Plus, Upload, ArrowRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import type { UseDashboardVm } from '../hooks/useDashboard'

export function DashboardPanels({ vm }: { vm: UseDashboardVm }) {
  const { recentProducts, canEdit } = vm
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Недавно обновленные</CardTitle>
            <CardDescription>Последние изменения в продуктах</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              Все продукты
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Нет продуктов
              </p>
            ) : (
              recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            {canEdit ? 'Добавление и импорт данных' : 'Только просмотр'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить продукт
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/products?action=import">
                  <Upload className="mr-2 h-4 w-4" />
                  Импорт данных
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Ваша роль позволяет только просматривать данные.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
