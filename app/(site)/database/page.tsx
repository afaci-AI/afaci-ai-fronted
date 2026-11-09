'use client'

import Link from 'next/link'
import { Package, MapPin, FolderTree, Layers, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Spinner } from '@/shared/ui/spinner'
import { useDatabaseBrowser, DatabaseFilters } from '@/features/catalog'

export default function DatabasePage() {
  const vm = useDatabaseBrowser()
  const {
    loading,
    error,
    categoryName,
    subcategoryName,
    regionName,
    filtered,
  } = vm

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          База данных
        </h1>
        <p className="mt-2 text-muted-foreground">
          Продукты питания и их нутриентный состав по регионам Кыргызстана
        </p>
      </div>

      {/* Filters */}
      <DatabaseFilters vm={vm} />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Spinner className="mr-2" /> Загрузка данных...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-24 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium text-foreground">
            Не удалось загрузить данные
          </p>
          <p className="text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-24 text-center text-muted-foreground">
          <Package className="h-8 w-8" />
          <p className="font-medium text-foreground">Продукты не найдены</p>
          <p className="text-sm">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Найдено продуктов: {filtered.length}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link key={p.id} href={`/database/${p.id}`} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base leading-snug group-hover:text-primary">
                        {p.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {categoryName(p.category_id) && (
                      <Badge variant="secondary" className="gap-1">
                        <FolderTree className="h-3 w-3" />
                        {categoryName(p.category_id)}
                      </Badge>
                    )}
                    {subcategoryName(p.subcategory_id) && (
                      <Badge variant="secondary" className="gap-1">
                        <Layers className="h-3 w-3" />
                        {subcategoryName(p.subcategory_id)}
                      </Badge>
                    )}
                    {regionName(p.region_id) && (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {regionName(p.region_id)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
