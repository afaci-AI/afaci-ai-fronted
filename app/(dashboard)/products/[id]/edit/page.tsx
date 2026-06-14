'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldMessage } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { AppHeader } from '@/components/app-header'
import { productsApi, categoriesApi, regionsApi, subcategoriesApi } from '@/lib/api'
import type { Product, Category, Region, Subcategory } from '@/lib/types'

interface FormData {
  name: string
  category_id: string
  subcategory_id: string
  region_id: string
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category_id: '',
    subcategory_id: '',
    region_id: '',
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [prods, cats, regs, subcats] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
        regionsApi.list(),
        subcategoriesApi.list()
      ])
      setCategories(cats)
      setRegions(regs)
      setSubcategories(subcats)

      const product = prods.find((p: Product) => p.id === id)
      if (product) {
        setFormData({
          name: product.name,
          category_id: product.category_id,
          subcategory_id: product.subcategory_id || '',
          region_id: product.region_id || '',
        })
      } else {
        toast.error('Продукт не найден')
        router.push('/products')
        return
      }
    } catch (e) {
      toast.error('Ошибка загрузки')
    } finally {
      setInitialLoading(false)
    }
  }

  const availableSubcategories = formData.category_id
    ? subcategories.filter(s => s.category_id === formData.category_id)
    : []

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    if (field === 'category_id') {
      setFormData((prev) => ({ ...prev, subcategory_id: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.name.trim()) newErrors.name = 'Название обязательно'
    if (!formData.category_id) newErrors.category_id = 'Выберите категорию'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await productsApi.update(id, {
        name: formData.name,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || undefined,
        region_id: formData.region_id,
      })
      toast.success('Продукт обновлён')
      router.push(`/products/${id}`)
    } catch (error) {
      toast.error('Не удалось обновить продукт')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (initialLoading) {
    return (
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Продукты', href: '/products' },
          { label: 'Редактирование' },
        ]}
      />
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Продукты', href: '/products' },
          { label: formData.name || 'Редактирование' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Редактирование продукта</CardTitle>
              <CardDescription>Измените информацию о продукте</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Название <span className="text-destructive">*</span></FieldLabel>
                    <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} aria-invalid={!!errors.name} />
                    {errors.name && <FieldMessage variant="error">{errors.name}</FieldMessage>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="category_id">Категория <span className="text-destructive">*</span></FieldLabel>
                    <Select value={formData.category_id} onValueChange={(v) => handleChange('category_id', v)}>
                      <SelectTrigger aria-invalid={!!errors.category_id}><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.category_id && <FieldMessage variant="error">{errors.category_id}</FieldMessage>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="subcategory_id">Подкатегория</FieldLabel>
                    <Select value={formData.subcategory_id} onValueChange={(v) => handleChange('subcategory_id', v)} disabled={!formData.category_id || availableSubcategories.length === 0}>
                      <SelectTrigger><SelectValue placeholder="Выберите подкатегорию" /></SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="region_id">Регион</FieldLabel>
                    <Select value={formData.region_id} onValueChange={(v) => handleChange('region_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Выберите регион" /></SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" asChild><Link href={`/products/${id}`}>Отмена</Link></Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner className="mr-2" />}Сохранить</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
