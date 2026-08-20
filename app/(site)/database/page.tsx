'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Package,
  MapPin,
  FolderTree,
  Layers,
  AlertCircle,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  productsApi,
  categoriesApi,
  subcategoriesApi,
  regionsApi,
} from '@/lib/api'
import type { Category, Subcategory, Product, Region } from '@/lib/types'

const ALL = 'all'
const FILTERS_KEY = 'database-filters'

const readStoredFilters = (): {
  query: string
  category: string
  subcategory: string
  region: string
} | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(FILTERS_KEY)
    if (!raw) return null
    const f = JSON.parse(raw)
    return {
      query: f.query ?? '',
      category: f.category ?? ALL,
      subcategory: f.subcategory ?? ALL,
      region: f.region ?? ALL,
    }
  } catch {
    // ignore malformed storage
    return null
  }
}

export default function DatabasePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState(() => readStoredFilters()?.query ?? '')
  const [category, setCategory] = useState<string>(
    () => readStoredFilters()?.category ?? ALL,
  )
  const [subcategory, setSubcategory] = useState<string>(
    () => readStoredFilters()?.subcategory ?? ALL,
  )
  const [region, setRegion] = useState<string>(
    () => readStoredFilters()?.region ?? ALL,
  )

  // Persist filters/search whenever they change.
  useEffect(() => {
    sessionStorage.setItem(
      FILTERS_KEY,
      JSON.stringify({ query, category, subcategory, region }),
    )
  }, [query, category, subcategory, region])

  useEffect(() => {
    ;(async () => {
      try {
        const [prods, cats, subs, regs] = await Promise.all([
          productsApi.list(),
          categoriesApi.list(),
          subcategoriesApi.list(),
          regionsApi.list(),
        ])
        setProducts(prods)
        setCategories(cats)
        setSubcategories(subs)
        setRegions(regs)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось загрузить данные')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name
  const subcategoryName = (id?: string) =>
    subcategories.find((s) => s.id === id)?.name
  const regionName = (id: string) => regions.find((r) => r.id === id)?.name

  // Subcategory options depend on the selected category.
  const subcategoryOptions = useMemo(
    () =>
      category === ALL
        ? subcategories
        : subcategories.filter((s) => s.category_id === category),
    [subcategories, category],
  )

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setSubcategory(ALL)
  }

  const hasActiveFilters =
    query !== '' || category !== ALL || subcategory !== ALL || region !== ALL

  const resetFilters = () => {
    setQuery('')
    setCategory(ALL)
    setSubcategory(ALL)
    setRegion(ALL)
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = p.name?.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === ALL || p.category_id === category
      const matchesSubcategory =
        subcategory === ALL || p.subcategory_id === subcategory
      const matchesRegion = region === ALL || p.region_id === region
      return (
        matchesQuery && matchesCategory && matchesSubcategory && matchesRegion
      )
    })
  }, [products, query, category, subcategory, region])

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
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию продукта..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex md:w-auto">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Все категории</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={subcategory}
            onValueChange={setSubcategory}
            disabled={subcategoryOptions.length === 0}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Подкатегория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Все подкатегории</SelectItem>
              {subcategoryOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Регион" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Все регионы</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="col-span-2 md:col-span-1"
          >
            <X className="mr-1 h-4 w-4" />
            Сбросить
          </Button>
        </div>
      </div>

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
