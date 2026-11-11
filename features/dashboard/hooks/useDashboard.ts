'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, FolderTree, MapPin, FlaskConical } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { hasPermission } from '@/shared/api/types'
import type { Product } from '@/shared/api/types'
import { productsApi } from '@/features/products'
import { categoriesApi, regionsApi, nutrientNamesApi } from '@/features/catalog'

export function useDashboard() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditProducts')

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    regions: 0,
    nutrients: 0,
  })
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [prods, cats, regs, nuts] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
        regionsApi.list(),
        nutrientNamesApi.list(),
      ])
      setStats({
        products: prods.length,
        categories: cats.length,
        regions: regs.length,
        nutrients: nuts.length,
      })
      setRecentProducts(prods.slice(0, 5))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await loadData()
    })()
  }, [loadData])

  const statsCards = [
    {
      title: 'Продукты',
      value: stats.products,
      icon: Package,
      href: '/products',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Категории',
      value: stats.categories,
      icon: FolderTree,
      href: '/dictionaries/categories',
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Регионы',
      value: stats.regions,
      icon: MapPin,
      href: '/dictionaries/regions',
      color: 'bg-warning/10 text-warning-foreground',
    },
    {
      title: 'Нутриенты',
      value: stats.nutrients,
      icon: FlaskConical,
      href: '/dictionaries/nutrient-names',
      color: 'bg-muted text-muted-foreground',
    },
  ]

  return {
    stats,
    setStats,
    recentProducts,
    setRecentProducts,
    loading,
    setLoading,
    user,
    canEdit,
    loadData,
    statsCards,
  }
}

export type UseDashboardVm = ReturnType<typeof useDashboard>
