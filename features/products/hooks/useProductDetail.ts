'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth'
import { hasPermission } from '@/shared/api/types'
import { productsApi, nutrientsApi } from '../api'
import {
  categoriesApi,
  regionsApi,
  nutrientNamesApi,
  nutrientTypesApi,
  unitsApi,
} from '@/features/catalog'
import type {
  Product,
  Category,
  Region,
  Nutrient,
  NutrientName,
  NutrientType,
  Unit,
} from '@/shared/api/types'

export function useProductDetail(params: Promise<{ id: string }>) {
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
  const [duplicateNutrient, setDuplicateNutrient] = useState<Nutrient | null>(
    null,
  )
  const [selectedNutrient, setSelectedNutrient] = useState<Nutrient | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nutrient_name_id: '',
    unit_id: '',
    quantity: '',
  })
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
        unitsApi.list(),
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

  const category = categories.find((c) => c.id === product?.category_id)
  const region = regions.find((r) => r.id === product?.region_id)

  const handleOpenDrawer = (nutrient?: Nutrient) => {
    if (nutrient) {
      setSelectedNutrient(nutrient)
      setFormData({
        nutrient_name_id: nutrient.nutrient_name_id,
        unit_id: nutrient.unit_id,
        quantity: String(nutrient.quantity),
      })
    } else {
      setSelectedNutrient(null)
      setFormData({ nutrient_name_id: '', unit_id: '', quantity: '' })
    }
    setErrors({})
    setDuplicateNutrient(null)
    setDrawerOpen(true)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev }
        delete n[field]
        return n
      })
  }

  const validate = (): boolean => {
    const newErrs: Record<string, string> = {}
    if (!formData.nutrient_name_id)
      newErrs.nutrient_name_id = 'Выберите нутриент'
    if (!formData.unit_id) newErrs.unit_id = 'Выберите единицу'
    if (!formData.quantity || isNaN(Number(formData.quantity)))
      newErrs.quantity = 'Введите число'
    setErrors(newErrs)
    return Object.keys(newErrs).length === 0
  }

  const handleSaveNutrient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (!selectedNutrient) {
      const existing = nutrients.find(
        (n) => n.nutrient_name_id === formData.nutrient_name_id,
      )
      if (existing) {
        setDuplicateNutrient(existing)
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (selectedNutrient) {
        await nutrientsApi.update(selectedNutrient.id, {
          quantity: Number(formData.quantity),
        })
        toast.success('Нутриент обновлён')
      } else {
        await nutrientsApi.create({
          product_id: id,
          nutrient_name_id: formData.nutrient_name_id,
          unit_id: formData.unit_id,
          quantity: Number(formData.quantity),
        })
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

  const handleUpdateDuplicate = async () => {
    if (!duplicateNutrient) return
    await nutrientsApi.update(duplicateNutrient.id, {
      quantity: Number(formData.quantity),
      unit_id: formData.unit_id,
    })
    toast.success('Нутриент обновлён')
    await loadData()
    setDuplicateNutrient(null)
    setDrawerOpen(false)
  }

  const handleSkipDuplicate = () => {
    setDuplicateNutrient(null)
    setDrawerOpen(false)
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

  return {
    id,
    product,
    setProduct,
    nutrients,
    setNutrients,
    loading,
    setLoading,
    error,
    setError,
    categories,
    setCategories,
    regions,
    setRegions,
    nutrientNames,
    setNutrientNames,
    nutrientTypes,
    setNutrientTypes,
    units,
    setUnits,
    drawerOpen,
    setDrawerOpen,
    deleteOpen,
    setDeleteOpen,
    duplicateNutrient,
    setDuplicateNutrient,
    selectedNutrient,
    setSelectedNutrient,
    isSubmitting,
    setIsSubmitting,
    formData,
    setFormData,
    errors,
    setErrors,
    user,
    canEdit,
    loadData,
    category,
    region,
    handleOpenDrawer,
    handleChange,
    validate,
    handleSaveNutrient,
    handleUpdateDuplicate,
    handleSkipDuplicate,
    handleDeleteNutrient,
    handleConfirmDelete,
  }
}

export type UseProductDetailVm = ReturnType<typeof useProductDetail>
