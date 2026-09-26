'use client'

import { useState } from 'react'
import { Loader2, TrendingDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { NumericInput } from '@/components/numeric-input'
import { parseNumberInput } from '@/lib/number'
import type { Row } from '../_hooks/useCalculator'
import type { OptConstraints } from '../api'
import type { CalcProduct } from '@/modules/products/api'

interface BoundRow {
  key: number
  min: string
  max: string
}

export function OptimizeCostDialog({
  rows,
  products,
  canOptimize,
  optimizing,
  onOptimize,
}: {
  rows: Row[]
  products: CalcProduct[]
  canOptimize: boolean
  optimizing: boolean
  onOptimize: (constraints: OptConstraints, bounds: BoundRow[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [bcMin, setBcMin] = useState('')
  const [krasMax, setKrasMax] = useState('')
  const [bounds, setBounds] = useState<BoundRow[]>([])

  const eligibleRows = rows.filter(
    (r) => r.product_id && parseNumberInput(r.price) !== null,
  )

  // Сброс границ при открытии: синхронное обновление состояния во время рендера.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setBounds(eligibleRows.map((r) => ({ key: r.key, min: '', max: '' })))
    }
  }

  const productName = (product_id: string) => {
    const p = products.find((p) => p.product_id === product_id)
    return p?.product_name ?? product_id
  }

  const patchBound = (key: number, patch: Partial<BoundRow>) =>
    setBounds((bs) => bs.map((b) => (b.key === key ? { ...b, ...patch } : b)))

  const handleSubmit = () => {
    const constraints: OptConstraints = {
      bc_min: parseNumberInput(bcMin) ?? undefined,
      kras_max: parseNumberInput(krasMax) ?? undefined,
    }
    onOptimize(constraints, bounds)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          disabled={!canOptimize || optimizing}
        >
          {optimizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Оптимизация…
            </>
          ) : (
            <>
              <TrendingDown className="mr-2 h-4 w-4" /> Оптимизировать стоимость
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Оптимизация стоимости рецептуры</DialogTitle>
          <DialogDescription>
            Находит наименьшую стоимость при ограничениях на качество белка. Все
            поля необязательны — оставьте пустыми для чистой минимизации
            стоимости.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div>
            <p className="mb-2 text-sm font-medium">Ограничения качества</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  БЦ ≥ (%, необяз.)
                </Label>
                <NumericInput
                  placeholder="напр. 60"
                  value={bcMin}
                  onValueChange={setBcMin}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  КРАС ≤ (%, необяз.)
                </Label>
                <NumericInput
                  placeholder="напр. 30"
                  value={krasMax}
                  onValueChange={setKrasMax}
                />
              </div>
            </div>
          </div>

          {eligibleRows.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">
                  Диапазоны X<sub>i</sub>, г
                </p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Ограничьте долю каждого ингредиента. По умолчанию 0–100 г.
                </p>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_90px_90px] gap-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <span>Сырьё</span>
                    <span>Мин, г</span>
                    <span>Макс, г</span>
                  </div>
                  {eligibleRows.map((row) => {
                    const bound = bounds.find((b) => b.key === row.key)
                    return (
                      <div
                        key={row.key}
                        className="grid grid-cols-[1fr_90px_90px] items-center gap-2"
                      >
                        <span className="truncate text-sm">
                          {productName(row.product_id)}
                        </span>
                        <NumericInput
                          placeholder="0"
                          value={bound?.min ?? ''}
                          onValueChange={(v) => patchBound(row.key, { min: v })}
                        />
                        <NumericInput
                          placeholder="100"
                          value={bound?.max ?? ''}
                          onValueChange={(v) => patchBound(row.key, { max: v })}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={eligibleRows.length === 0}>
            <TrendingDown className="mr-2 h-4 w-4" /> Оптимизировать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
