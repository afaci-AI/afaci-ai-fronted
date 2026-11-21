'use client'

import Link from 'next/link'
import { Pencil, FlaskConical, Package, MapPin, FolderTree } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import type { Product } from '@/shared/api/types'
import type { UseProductDetailVm } from '../hooks/useProductDetail'

export function ProductInfoCard({ vm }: { vm: UseProductDetailVm }) {
  const { id, nutrients, canEdit, category, region } = vm
  // Страница показывает карточку только после загрузки продукта.
  const product = vm.product as Product
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl">{product.name}</CardTitle>
          </div>
        </div>
        {canEdit && (
          <Button variant="outline" asChild>
            <Link href={`/products/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <FolderTree className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Категория</p>
              <p className="font-medium">{category?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-success/10">
              <MapPin className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Регион</p>
              <p className="font-medium">{region?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Нутриентов</p>
              <p className="font-medium">{nutrients.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
