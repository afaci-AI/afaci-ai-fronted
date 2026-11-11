'use client'

import Link from 'next/link'
import { Bookmark, Sparkles, Calculator } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function SavedRecipesHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Bookmark className="h-7 w-7 text-primary" />
          Сохранённые рецептуры
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ваши рецептуры и группы. Перемещайте между группами, редактируйте и
          удаляйте.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/ranking">
            <Sparkles className="mr-1.5 h-4 w-4" /> Ранжирование
          </Link>
        </Button>
        <Button asChild>
          <Link href="/calculator">
            <Calculator className="mr-1.5 h-4 w-4" /> В калькулятор
          </Link>
        </Button>
      </div>
    </div>
  )
}
