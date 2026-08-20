'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Plus, FlaskConical, Package, MapPin, FolderTree, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldMessage } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { AppHeader } from '@/components/app-header'
import { DeleteDialog } from '@/components/delete-dialog'
import { useAuth } from '@/lib/auth-context'
import { hasPermission } from '@/lib/types'
import { productsApi, nutrientsApi, categoriesApi, regionsApi, nutrientNamesApi, nutrientTypesApi, unitsApi } from '@/lib/api'
import type { Product, Category, Region, Nutrient, NutrientName, NutrientType, Unit } from '@/lib/types'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditProducts')

  const [product, setProduct] = useState<Product | null>(null)
  const [nutrients, setNutrients] = useState<Nutrient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [nutrientNames, setNutrientNames] = useState<NutrientName[]>([])
  const [nutrientTypes, setNutrientTypes] = useState<NutrientType[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedNutrient, setSelectedNutrient] = useState<Nutrient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ nutrient_name_id: '', unit_id: '', quantity: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const [prod, nuts, cats, regs, names, types, uns] = await Promise.all([
        productsApi.get(id),
        nutrientsApi.byProduct(id),
        categoriesApi.list(),
        regionsApi.list(),
        nutrientNamesApi.list(),
        nutrientTypesApi.list(),
        unitsApi.list()
      ])
      setProduct(prod)
      setNutrients(nuts)
      setCategories(cats)
      setRegions(regs)
      setNutrientNames(names)
      setNutrientTypes(types)
      setUnits(uns)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    ;(async () => {
      await loadData()
    })()
  }, [loadData])

  const category = categories.find(c => c.id === product?.category_id)
  const region = regions.find(r => r.id === product?.region_id)

  const handleOpenDrawer = (nutrient?: Nutrient) => {
    if (nutrient) {
      setSelectedNutrient(nutrient)
      setFormData({ nutrient_name_id: nutrient.nutrient_name_id, unit_id: nutrient.unit_id, quantity: String(nutrient.quantity) })
    } else {
      setSelectedNutrient(null)
      setFormData({ nutrient_name_id: '', unit_id: '', quantity: '' })
    }
    setErrors({})
    setDrawerOpen(true)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const validate = (): boolean => {
    const newErrs: Record<string, string> = {}
    if (!formData.nutrient_name_id) newErrs.nutrient_name_id = 'Выберите нутриент'
    if (!formData.unit_id) newErrs.unit_id = 'Выберите единицу'
    if (!formData.quantity || isNaN(Number(formData.quantity))) newErrs.quantity = 'Введите число'
    setErrors(newErrs)
    return Object.keys(newErrs).length === 0
  }

  const handleSaveNutrient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      if (selectedNutrient) {
        await nutrientsApi.update(selectedNutrient.id, { quantity: Number(formData.quantity) })
        toast.success('Нутриент обновлён')
      } else {
        await nutrientsApi.create({ product_id: id, nutrient_name_id: formData.nutrient_name_id, unit_id: formData.unit_id, quantity: Number(formData.quantity) })
        toast.success('Нутриент добавлен')
      }
      await loadData()
      setDrawerOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNutrient = (nutrient: Nutrient) => {
    setSelectedNutrient(nutrient)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedNutrient) return
    setIsSubmitting(true)
    try {
      await nutrientsApi.delete(selectedNutrient.id)
      await loadData()
      setDeleteOpen(false)
      setSelectedNutrient(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка удаления')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <AppHeader breadcrumbs={[{ label: 'Главная', href: '/dashboard' }, { label: 'Продукты', href: '/products' }, { label: 'Загрузка...' }]} />
  }

  if (!product && !error) return notFound()

  if (!product) return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Главная', href: '/dashboard' }, { label: 'Продукты', href: '/products' }, { label: 'Ошибка' }]} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>
      </main>
    </>
  )

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Главная', href: '/dashboard' }, { label: 'Продукты', href: '/products' }, { label: product.name }]} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">{error}</div>}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><Package className="h-6 w-6 text-muted-foreground" /></div>
                <div><CardTitle className="text-xl">{product.name}</CardTitle></div>
              </div>
              {canEdit && <Button variant="outline" asChild><Link href={`/products/${id}/edit`}><Pencil className="mr-2 h-4 w-4" />Редактировать</Link></Button>}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10"><FolderTree className="h-4 w-4 text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground">Категория</p><p className="font-medium">{category?.name || '—'}</p></div>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Нутриенты</CardTitle><CardDescription>Пищевая ценность на 100 г продукта</CardDescription></div>
              {canEdit && <Button onClick={() => handleOpenDrawer()}><Plus className="mr-2 h-4 w-4" />Добавить</Button>}
            </CardHeader>
            <CardContent>
              {nutrients.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                  <FlaskConical className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">Нутриенты не добавлены</p>
                  {canEdit && <Button variant="outline" size="sm" className="mt-3" onClick={() => handleOpenDrawer()}><Plus className="mr-2 h-4 w-4" />Добавить нутриент</Button>}
                </div>
              ) : (() => {
                const grouped = nutrientTypes.map(type => ({
                  type,
                  items: nutrients.filter(n => {
                    const nm = nutrientNames.find(x => x.id === n.nutrient_name_id)
                    return nm?.nutrient_type_id === type.id
                  }),
                })).filter(g => g.items.length > 0)

                const ungrouped = nutrients.filter(n => {
                  const nm = nutrientNames.find(x => x.id === n.nutrient_name_id)
                  return !nm?.nutrient_type_id || !nutrientTypes.find(t => t.id === nm.nutrient_type_id)
                })

                return (
                  <div className="space-y-6">
                    {grouped.map(({ type, items }) => (
                      <div key={type.id}>
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{type.name}</Badge>
                          <span className="text-xs text-muted-foreground">{items.length} позиций</span>
                        </div>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Нутриент</TableHead>
                                <TableHead className="text-right">Количество</TableHead>
                                <TableHead>Единица</TableHead>
                                {canEdit && <TableHead className="w-[80px]" />}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map(n => {
                                const name = nutrientNames.find(x => x.id === n.nutrient_name_id)
                                const unit = units.find(x => x.id === n.unit_id)
                                return (
                                  <TableRow key={n.id}>
                                    <TableCell className="font-medium">{name?.name || '—'}</TableCell>
                                    <TableCell className="text-right tabular-nums">{n.quantity}</TableCell>
                                    <TableCell><Badge variant="outline">{unit?.name || '—'}</Badge></TableCell>
                                    {canEdit && (
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDrawer(n)}><Pencil className="h-4 w-4" /></Button>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteNutrient(n)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}

                    {ungrouped.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Без типа</Badge>
                          <span className="text-xs text-muted-foreground">{ungrouped.length} позиций</span>
                        </div>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Нутриент</TableHead>
                                <TableHead className="text-right">Количество</TableHead>
                                <TableHead>Единица</TableHead>
                                {canEdit && <TableHead className="w-[80px]" />}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ungrouped.map(n => {
                                const name = nutrientNames.find(x => x.id === n.nutrient_name_id)
                                const unit = units.find(x => x.id === n.unit_id)
                                return (
                                  <TableRow key={n.id}>
                                    <TableCell className="font-medium">{name?.name || '—'}</TableCell>
                                    <TableCell className="text-right tabular-nums">{n.quantity}</TableCell>
                                    <TableCell><Badge variant="outline">{unit?.name || '—'}</Badge></TableCell>
                                    {canEdit && (
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDrawer(n)}><Pencil className="h-4 w-4" /></Button>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteNutrient(n)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent>
            <SheetHeader><SheetTitle>{selectedNutrient ? 'Редактировать нутриент' : 'Добавить нутриент'}</SheetTitle><SheetDescription>Укажите нутриент и его количество</SheetDescription></SheetHeader>
            <form onSubmit={handleSaveNutrient} className="mt-6 space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Нутриент *</FieldLabel>
                  <Select value={formData.nutrient_name_id} onValueChange={v => handleChange('nutrient_name_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Выберите нутриент" /></SelectTrigger>
                    <SelectContent>{nutrientNames.map(n => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.nutrient_name_id && <FieldMessage variant="error">{errors.nutrient_name_id}</FieldMessage>}
                </Field>
                <Field>
                  <FieldLabel>Количество *</FieldLabel>
                  <Input type="number" step="any" placeholder="Например: 3.2" value={formData.quantity} onChange={e => handleChange('quantity', e.target.value)} />
                  {errors.quantity && <FieldMessage variant="error">{errors.quantity}</FieldMessage>}
                </Field>
                <Field>
                  <FieldLabel>Единица измерения *</FieldLabel>
                  <Select value={formData.unit_id} onValueChange={v => handleChange('unit_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Выберите единицу" /></SelectTrigger>
                    <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.unit_id && <FieldMessage variant="error">{errors.unit_id}</FieldMessage>}
                </Field>
              </FieldGroup>
              <SheetFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner className="mr-2" />}{selectedNutrient ? 'Сохранить' : 'Добавить'}</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Удалить нутриент?" description="Эта запись о нутриенте будет удалена из продукта." onConfirm={handleConfirmDelete} loading={isSubmitting} />
      </main>
    </>
  )
}