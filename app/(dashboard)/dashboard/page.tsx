'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { AppHeader } from '@/app/_shell/app-header'
import {
  useDashboard,
  DashboardPanels,
  DashboardActions,
} from '@/features/dashboard'
export default function DashboardPage() {
  const vm = useDashboard()
  const { loading, user, statsCards } = vm

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Главная' }]} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Добро пожаловать, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Обзор базы данных продуктов и нутриентов
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-md p-2 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <DashboardPanels vm={vm} />

        <DashboardActions vm={vm} />
      </main>
    </>
  )
}
