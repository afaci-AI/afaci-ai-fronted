'use client'

import { Calculator as CalcIcon, Loader2 } from 'lucide-react'
import { Card } from '@/shared/ui/card'
import { Results } from '@/features/calculator'
import {
  useCalculatorPage,
  CalculatorReferenceHeader,
  CalculatorIngredients,
} from '@/features/calculator'
export default function CalculatorPage() {
  const vm = useCalculatorPage()
  const { authLoading, isAuthenticated, result, loading } = vm

  if (authLoading || !isAuthenticated) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-32 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Проверка доступа…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <CalcIcon className="h-7 w-7 text-primary" />
          Калькулятор пищевой и биологической ценности
        </h1>
        <p className="mt-2 text-muted-foreground">
          Расчёт по методике Липатова: макросостав, аминокислотный скор и
          качественные показатели рецептуры.
        </p>
      </div>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-20 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Загрузка справочников…
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CalculatorReferenceHeader vm={vm} />
            <CalculatorIngredients vm={vm} />
          </Card>

          {result && <Results result={result} />}
        </>
      )}
    </div>
  )
}
