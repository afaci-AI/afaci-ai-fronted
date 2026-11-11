'use client'

import { RotateCcw, Sparkles } from 'lucide-react'
import { CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import type { UseCalculatorPageVm } from '../hooks/useCalculatorPage'

export function CalculatorReferenceHeader({ vm }: { vm: UseCalculatorPageVm }) {
  const { recipes, loadExample, reset } = vm
  return (
    <CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Входные данные</CardTitle>
          <CardDescription>
            Подберите ингредиенты из банка данных и задайте массу Xᵢ. База
            рецептуры — 100 г.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadExample}
            disabled={!recipes.length}
          >
            <Sparkles className="mr-1.5 h-4 w-4" /> Загрузить пример
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Сбросить
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
