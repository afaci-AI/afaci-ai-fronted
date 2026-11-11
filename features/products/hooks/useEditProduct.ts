'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { productsApi } from '../api'
import { categoriesApi, regionsApi, subcategoriesApi } from '@/features/catalog'
import type { Product, Category, Region, Subcategory } from '@/shared/api/types'
import { FormData } from '../model/edit-product-form'

export function useEditProduct(params: Promise<{ id: string }>) {
  const { id } = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
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
      const [prods, cats, regs, subcats] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
        regionsApi.list(),
        subcategoriesApi.list(),
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
    } catch {
      toast.error('Ошибка загрузки')
    } finally {
      setInitialLoading(false)
    }
  }, [id, router])

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
    } catch {
      toast.error('Не удалось обновить продукт')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    setIsSubmitting,
    initialLoading,
    setInitialLoading,
    errors,
    setErrors,
    formData,
    setFormData,
    categories,
    setCategories,
    regions,
    setRegions,
    subcategories,
    setSubcategories,
    id,
    router,
    loadData,
    availableSubcategories,
    handleChange,
    validate,
    handleSubmit,
  }
}

export type UseEditProductVm = ReturnType<typeof useEditProduct>
