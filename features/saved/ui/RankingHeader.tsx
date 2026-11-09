'use client'

import Link from 'next/link'
import { Sparkles, Bookmark } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function RankingHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Sparkles className="h-7 w-7 text-primary" />
          Ранжирование рецептур
        </h1>
        <p className="mt-2 text-muted-foreground">
          Выберите сохранённые рецептуры — программа определит лучшую по
          показателям БЦ, КРАС, U и G и построит градацию от лучшей к худшей.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/saved-recipes">
          <Bookmark className="mr-1.5 h-4 w-4" /> К рецептурам
        </Link>
      </Button>
    </div>
  )
}
