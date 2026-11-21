'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { categoriesApi, regionsApi, subcategoriesApi } from '@/features/catalog'
import { productsApi } from '../api'
import type { Category, Region, Subcategory } from '@/shared/api/types'
import { FormData } from '../model/new-product-form'

export function useNewProduct() {
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

  return {
    isSubmitting,
    setIsSubmitting,
    loading,
    setLoading,
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
    router,
    loadData,
    availableSubcategories,
    handleChange,
    validate,
    handleSubmit,
  }
}

export type UseNewProductVm = ReturnType<typeof useNewProduct>
