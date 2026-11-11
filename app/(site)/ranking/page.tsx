'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import {
  useRanking,
  RankingHeader,
  RankingSelectionCard,
  RankingResults,
} from '@/features/saved'

export default function RankingPage() {
  const vm = useRanking()
  const {
    loading,
    result,
    isAuthenticated,
    authLoading,
    computable,
    draftCount,
    winner,
  } = vm

  if (authLoading || !isAuthenticated) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-32 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Проверка доступа…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RankingHeader />

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-20 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Загрузка…
        </div>
      ) : computable.length < 2 ? (
        <Card>
          <CardContent className="text-muted-foreground py-16 text-center">
            Для ранжирования нужно минимум две рассчитанные рецептуры. Сейчас их{' '}
            {computable.length}
            {draftCount > 0 && ` (черновиков без расчёта: ${draftCount})`}.
            Сохраните рецептуры с расчётом в{' '}
            <Link href="/calculator" className="text-primary underline">
              калькуляторе
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Выбор рецептур */}
          <RankingSelectionCard vm={vm} />

          {/* Результаты */}
          {result && winner && <RankingResults vm={vm} />}
        </>
      )}
    </div>
  )
}
