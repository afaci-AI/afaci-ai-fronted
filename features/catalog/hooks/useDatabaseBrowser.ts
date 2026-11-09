'use client'

import { useEffect, useMemo, useState } from 'react'
import { productsApi } from '@/features/products'
import { categoriesApi, subcategoriesApi, regionsApi } from '../api'
import type { Category, Subcategory, Product, Region } from '@/shared/api/types'
import { ALL, FILTERS_KEY, readStoredFilters } from '../model/stored-filters'

export function useDatabaseBrowser() {
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

  return {
    products,
    setProducts,
    categories,
    setCategories,
    subcategories,
    setSubcategories,
    regions,
    setRegions,
    loading,
    setLoading,
    error,
    setError,
    query,
    setQuery,
    category,
    setCategory,
    subcategory,
    setSubcategory,
    region,
    setRegion,
    categoryName,
    subcategoryName,
    regionName,
    subcategoryOptions,
    handleCategoryChange,
    hasActiveFilters,
    resetFilters,
    filtered,
  }
}

export type UseDatabaseBrowserVm = ReturnType<typeof useDatabaseBrowser>
