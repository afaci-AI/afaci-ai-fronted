'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, FolderTree, MapPin, FlaskConical, Plus, Upload, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/app-header'
import { useAuth } from '@/lib/auth-context'
import { hasPermission } from '@/lib/types'
import { productsApi, categoriesApi, regionsApi, nutrientNamesApi } from '@/lib/api'

export default function DashboardPage() {
  const { user } = useAuth()
  const canEdit = user && hasPermission(user.role, 'canEditProducts')

  const [stats, setStats] = useState({ products: 0, categories: 0, regions: 0, nutrients: 0 })
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [prods, cats, regs, nuts] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
        regionsApi.list(),
        nutrientNamesApi.list()
      ])
      setStats({ products: prods.length, categories: cats.length, regions: regs.length, nutrients: nuts.length })
      setRecentProducts(prods.slice(0, 5))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    { title: 'Продукты', value: stats.products, icon: Package, href: '/products', color: 'bg-primary/10 text-primary' },
    { title: 'Категории', value: stats.categories, icon: FolderTree, href: '/dictionaries/categories', color: 'bg-success/10 text-success' },
    { title: 'Регионы', value: stats.regions, icon: MapPin, href: '/dictionaries/regions', color: 'bg-warning/10 text-warning-foreground' },
    { title: 'Нутриенты', value: stats.nutrients, icon: FlaskConical, href: '/dictionaries/nutrient-names', color: 'bg-muted text-muted-foreground' },
  ]

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Главная' }]} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Добро пожаловать, {user?.name}</h1>
          <p className="text-muted-foreground">Обзор базы данных продуктов и нутриентов</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`rounded-md p-2 ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{loading ? '...' : stat.value}</div></CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Недавно обновленные</CardTitle><CardDescription>Последние изменения в продуктах</CardDescription></div>
              <Button variant="ghost" size="sm" asChild><Link href="/products">Все продукты<ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Нет продуктов</p>
                ) : (
                  recentProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"><Package className="h-4 w-4 text-muted-foreground" /></div>
                        <div><p className="text-sm font-medium">{product.name}</p></div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Быстрые действия</CardTitle><CardDescription>{canEdit ? 'Добавление и импорт данных' : 'Только просмотр'}</CardDescription></CardHeader>
            <CardContent>
              {canEdit ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild><Link href="/products/new"><Plus className="mr-2 h-4 w-4" />Добавить продукт</Link></Button>
                  <Button variant="outline" className="w-full justify-start" asChild><Link href="/products?action=import"><Upload className="mr-2 h-4 w-4" />Импорт данных</Link></Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Ваша роль позволяет только просматривать данные.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle>Справочники</CardTitle><CardDescription>Быстрый доступ к справочным таблицам</CardDescription></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'Категории', href: '/dictionaries/categories', count: stats.categories },
                { label: 'Подкатегории', href: '/dictionaries/subcategories', count: '-' },
                { label: 'Регионы', href: '/dictionaries/regions', count: stats.regions },
                { label: 'Типы нутриентов', href: '/dictionaries/nutrient-types', count: '-' },
                { label: 'Названия нутриентов', href: '/dictionaries/nutrient-names', count: stats.nutrients },
                { label: 'Единицы измерения', href: '/dictionaries/units', count: '-' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="flex flex-col items-center rounded-lg border p-4 text-center transition-colors hover:bg-muted/50">
                  <span className="text-lg font-semibold">{item.count}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}