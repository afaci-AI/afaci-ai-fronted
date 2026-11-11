'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import type { UseDashboardVm } from '../hooks/useDashboard'

export function DashboardActions({ vm }: { vm: UseDashboardVm }) {
  const { stats } = vm
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Справочники</CardTitle>
        <CardDescription>Быстрый доступ к справочным таблицам</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {[
            {
              label: 'Категории',
              href: '/dictionaries/categories',
              count: stats.categories,
            },
            {
              label: 'Подкатегории',
              href: '/dictionaries/subcategories',
              count: '-',
            },
            {
              label: 'Регионы',
              href: '/dictionaries/regions',
              count: stats.regions,
            },
            {
              label: 'Типы нутриентов',
              href: '/dictionaries/nutrient-types',
              count: '-',
            },
            {
              label: 'Названия нутриентов',
              href: '/dictionaries/nutrient-names',
              count: stats.nutrients,
            },
            {
              label: 'Единицы измерения',
              href: '/dictionaries/units',
              count: '-',
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center rounded-lg border p-4 text-center transition-colors hover:bg-muted/50"
            >
              <span className="text-lg font-semibold">{item.count}</span>
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
