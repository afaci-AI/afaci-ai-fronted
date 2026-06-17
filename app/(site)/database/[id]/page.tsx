'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FlaskConical, Package, MapPin, FolderTree, Layers, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ProductNutrientCharts } from '@/components/product-nutrient-charts'
import { productsApi, nutrientsApi, categoriesApi, subcategoriesApi, regionsApi, nutrientNamesApi, nutrientTypesApi, unitsApi } from '@/lib/api'
import type { Product, Category, Subcategory, Region, Nutrient, NutrientName, NutrientType, Unit } from '@/lib/types'

export default function PublicProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [product, setProduct] = useState<Product | null>(null)
  const [nutrients, setNutrients] = useState<Nutrient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [nutrientNames, setNutrientNames] = useState<NutrientName[]>([])
  const [nutrientTypes, setNutrientTypes] = useState<NutrientType[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setError(null)
        const [prod, nuts, cats, subs, regs, names, types, uns] = await Promise.all([
          productsApi.get(id),
          nutrientsApi.byProduct(id),
          categoriesApi.list(),
          subcategoriesApi.list(),
          regionsApi.list(),
          nutrientNamesApi.list(),
          nutrientTypesApi.list(),
          unitsApi.list(),
        ])
        setProduct(prod)
        setNutrients(nuts)
        setCategories(cats)
        setSubcategories(subs)
        setRegions(regs)
        setNutrientNames(names)
        setNutrientTypes(types)
        setUnits(uns)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const category = categories.find((c) => c.id === product?.category_id)
  const subcategory = subcategories.find((s) => s.id === product?.subcategory_id)
  const region = regions.find((r) => r.id === product?.region_id)

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 text-muted-foreground sm:px-6 lg:px-8">
        <Spinner className="mr-2" /> Загрузка продукта...
      </div>
    )
  }

  if (!product && !error) return notFound()

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href="/database"><ArrowLeft className="mr-2 h-4 w-4" />К базе данных</Link>
        </Button>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-24 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium text-foreground">Не удалось загрузить продукт</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-4 -ml-2">
        <Link href="/database"><ArrowLeft className="mr-2 h-4 w-4" />К базе данных</Link>
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl leading-tight">{product.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10"><FolderTree className="h-4 w-4 text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Категория</p><p className="font-medium">{category?.name || '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10"><Layers className="h-4 w-4 text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Подкатегория</p><p className="font-medium">{subcategory?.name || '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-success/10"><MapPin className="h-4 w-4 text-success" /></div>
                <div><p className="text-xs text-muted-foreground">Регион</p><p className="font-medium">{region?.name || '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"><FlaskConical className="h-4 w-4 text-muted-foreground" /></div>
                <div><p className="text-xs text-muted-foreground">Нутриентов</p><p className="font-medium">{nutrients.length}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {nutrients.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Нутриенты</CardTitle>
              <CardDescription>Пищевая ценность на 100 г продукта</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground">
                <FlaskConical className="mb-3 h-10 w-10" />
                <p>Нутриенты не добавлены</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ProductNutrientCharts
            nutrients={nutrients}
            nutrientNames={nutrientNames}
            nutrientTypes={nutrientTypes}
            units={units}
          />
        )}
      </div>
    </div>
  )
}
