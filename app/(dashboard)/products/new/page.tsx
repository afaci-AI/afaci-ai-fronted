'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldMessage,
} from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { AppHeader } from '@/components/app-header'
import {
  categoriesApi,
  regionsApi,
  subcategoriesApi,
  productsApi,
} from '@/lib/api'
import type { Category, Region, Subcategory } from '@/lib/types'

interface FormData {
  name: string
  category_id: string
  subcategory_id: string
  region_id: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  )
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category_id: '',
    subcategory_id: '',
    region_id: '',
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  const loadData = useCallback(async () => {
    try {
      const [cats, regs, subcats] = await Promise.all([
        categoriesApi.list(),
        regionsApi.list(),
        subcategoriesApi.list(),
      ])
      setCategories(cats)
      setRegions(regs)
      setSubcategories(subcats)
    } catch {
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await loadData()
    })()
  }, [loadData])

  const availableSubcategories = formData.category_id
    ? subcategories.filter((s) => s.category_id === formData.category_id)
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

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно'
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Выберите категорию'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await productsApi.create({
        name: formData.name,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || undefined,
        region_id: formData.region_id,
      })
      toast.success('Продукт создан')
      router.push('/products')
    } catch {
      toast.error('Не удалось создать продукт')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AppHeader
        breadcrumbs={[
          { label: 'Глав��ая', href: '/dashboard' },
          { label: 'Продукты', href: '/products' },
          { label: 'Новый продукт' },
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
          { label: 'Новый продукт' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Новый продукт</CardTitle>
              <CardDescription>
                Заполните информацию о продукте. После создания можно добавить
                нутриенты.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">
                      Название <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="name"
                      placeholder="Например: Молоко коровье 3.2%"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <FieldMessage variant="error">{errors.name}</FieldMessage>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="category_id">
                      Категория <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        handleChange('category_id', value)
                      }
                    >
                      <SelectTrigger aria-invalid={!!errors.category_id}>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && (
                      <FieldMessage variant="error">
                        {errors.category_id}
                      </FieldMessage>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="subcategory_id">
                      Подкатегория
                    </FieldLabel>
                    <Select
                      value={formData.subcategory_id}
                      onValueChange={(value) =>
                        handleChange('subcategory_id', value)
                      }
                      disabled={
                        !formData.category_id ||
                        availableSubcategories.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !formData.category_id
                              ? 'Сначала выберите категорию'
                              : availableSubcategories.length === 0
                                ? 'Нет подкатегорий'
                                : 'Выберите подкатегорию'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="region_id">Регион</FieldLabel>
                    <Select
                      value={formData.region_id}
                      onValueChange={(value) =>
                        handleChange('region_id', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите регион" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner className="mr-2" />}
                    Создать продукт
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
