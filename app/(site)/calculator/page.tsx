'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Calculator as CalcIcon, FlaskConical, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { productsApi, nutrientsApi, nutrientNamesApi, unitsApi } from '@/lib/api'
import type { NutrientName, Product, Unit } from '@/lib/types'

interface SelectedItem {
  product: Product
  grams: number
}

interface NutrientRow {
  id: string
  product_id: string
  nutrient_name_id: string
  unit_id: string
  quantity: number
}

export default function CalculatorPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [nutrientNames, setNutrientNames] = useState<NutrientName[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)

  const [items, setItems] = useState<SelectedItem[]>([])
  const [nutrientsByProduct, setNutrientsByProduct] = useState<Record<string, NutrientRow[]>>({})

  const [productId, setProductId] = useState('')
  const [grams, setGrams] = useState('100')

  useEffect(() => {
    ;(async () => {
      try {
        const [prods, names, uns] = await Promise.all([
          productsApi.list(),
          nutrientNamesApi.list(),
          unitsApi.list(),
        ])
        setProducts(prods)
        setNutrientNames(names)
        setUnits(uns)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const nameOf = (id: string) => nutrientNames.find((n) => n.id === id)?.name ?? '—'
  const unitOf = (id: string) => units.find((u) => u.id === id)?.name ?? ''

  const addItem = async () => {
    const product = products.find((p) => p.id === productId)
    const weight = Number(grams)
    if (!product || !weight || weight <= 0) return
    if (items.some((i) => i.product.id === product.id)) return

    setItems((prev) => [...prev, { product, grams: weight }])
    setProductId('')
    setGrams('100')

    if (!nutrientsByProduct[product.id]) {
      try {
        const nuts = await nutrientsApi.byProduct(product.id)
        setNutrientsByProduct((prev) => ({ ...prev, [product.id]: nuts }))
      } catch {
        setNutrientsByProduct((prev) => ({ ...prev, [product.id]: [] }))
      }
    }
  }

  const updateGrams = (id: string, value: string) => {
    const weight = Number(value)
    setItems((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, grams: isNaN(weight) ? 0 : weight } : i)),
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id))
  }

  // Sum nutrients across selected items, scaling per 100g.
  const totals = useMemo(() => {
    const map = new Map<string, { name: string; unit: string; total: number }>()
    for (const item of items) {
      const nuts = nutrientsByProduct[item.product.id] ?? []
      const factor = item.grams / 100
      for (const n of nuts) {
        const key = `${n.nutrient_name_id}|${n.unit_id}`
        const existing = map.get(key)
        const add = n.quantity * factor
        if (existing) {
          existing.total += add
        } else {
          map.set(key, { name: nameOf(n.nutrient_name_id), unit: unitOf(n.unit_id), total: add })
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  }, [items, nutrientsByProduct, nutrientNames, units])

  const availableProducts = products.filter((p) => !items.some((i) => i.product.id === p.id))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Калькулятор нутриентов</h1>
        <p className="mt-2 text-muted-foreground">
          Добавьте продукты и укажите вес порции — расчёт ведётся на 100 г состава
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Spinner className="mr-2" /> Загрузка...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Selection + items */}
          <div className="space-y-6 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Добавить продукт</CardTitle>
                <CardDescription>Выберите продукт и вес порции в граммах</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Выберите продукт" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-3">
                    <div className="relative w-32">
                      <Input
                        type="number"
                        min={1}
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        г
                      </span>
                    </div>
                    <Button onClick={addItem} disabled={!productId} className="shrink-0">
                      <Plus className="mr-1 h-4 w-4" />
                      Добавить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Выбранные продукты</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Пока ничего не добавлено
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {items.map((item) => (
                      <li key={item.product.id} className="flex items-center gap-3 py-3">
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {item.product.name}
                        </span>
                        <div className="relative w-24">
                          <Input
                            type="number"
                            min={1}
                            value={item.grams}
                            onChange={(e) => updateGrams(item.product.id, e.target.value)}
                            className="h-9 pr-7"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            г
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive"
                          onClick={() => removeItem(item.product.id)}
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalcIcon className="h-5 w-5 text-primary" />
                  Итоговый состав
                </CardTitle>
                <CardDescription>Суммарно по всем выбранным продуктам</CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                    <FlaskConical className="h-8 w-8" />
                    <p className="text-sm">Добавьте продукты, чтобы увидеть расчёт</p>
                  </div>
                ) : totals.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                    <Info className="h-8 w-8" />
                    <p className="text-sm">Для выбранных продуктов нет данных о нутриентах</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Нутриент</TableHead>
                        <TableHead className="text-right">Кол-во</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {totals.map((t) => (
                        <TableRow key={`${t.name}-${t.unit}`}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {t.total.toLocaleString('ru', { maximumFractionDigits: 2 })}
                            <span className="ml-1 text-muted-foreground">{t.unit}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
