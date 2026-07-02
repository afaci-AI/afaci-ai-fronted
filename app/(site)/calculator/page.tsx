'use client'

import {
  Calculator as CalcIcon, Plus, Trash2, Loader2, AlertTriangle, Check, RotateCcw, Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  useCalculator,
  ProductCombobox,
  ReferenceInfoButton,
  SaveRecipeDialog,
  OptimizeCostDialog,
  Results,
  nf,
} from '@/modules/calculator'

export default function CalculatorPage() {
  const {
    authLoading, isAuthenticated,
    references, refId, setRefId, selectedRef,
    products, recipes,
    rows, result, loading, computing, optimizing, editing,
    sum, sumValid, canCompute, canOptimize, usedIds,
    REQUIRED_SUM,
    costEnabled, setCostEnabled, totalCost,
    addRow, removeRow, patchRow, loadExample, reset, compute, optimizeCost,
  } = useCalculator()

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
          Расчёт по методике Липатова: макросостав, аминокислотный скор и качественные показатели рецептуры.
        </p>
      </div>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-20 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Загрузка справочников…
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Входные данные</CardTitle>
                  <CardDescription>
                    Подберите ингредиенты из банка данных и задайте массу Xᵢ. База рецептуры — 100 г.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadExample} disabled={!recipes.length}>
                    <Sparkles className="mr-1.5 h-4 w-4" /> Загрузить пример
                  </Button>
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Сбросить
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-end gap-3">
                <div className="grow max-w-md">
                  <Label className="mb-1.5 block">Эталонный белок (шкала скора)</Label>
                  <Select value={refId} onValueChange={setRefId}>
                    <SelectTrigger><SelectValue placeholder="Выберите эталон" /></SelectTrigger>
                    <SelectContent>
                      {references.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}{r.is_default ? ' — по умолчанию' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedRef && <ReferenceInfoButton reference={selectedRef} />}
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Switch id="cost-toggle" checked={costEnabled} onCheckedChange={setCostEnabled} />
                <Label htmlFor="cost-toggle" className="cursor-pointer text-sm">
                  Рассчитать стоимость сырья
                </Label>
              </div>

              <div className="space-y-2">
                <div className={cn(
                  'text-muted-foreground grid gap-2 px-1 text-xs font-medium uppercase tracking-wide',
                  costEnabled ? 'grid-cols-[1fr_140px_120px_40px]' : 'grid-cols-[1fr_140px_40px]',
                )}>
                  <span>Сырьё</span><span>Xᵢ, г</span>
                  {costEnabled && <span>Цена, сом/г</span>}
                  <span />
                </div>
                {rows.map((row) => (
                  <div key={row.key} className={cn(
                    'grid items-center gap-2',
                    costEnabled ? 'grid-cols-[1fr_140px_120px_40px]' : 'grid-cols-[1fr_140px_40px]',
                  )}>
                    <ProductCombobox
                      value={row.product_id}
                      onChange={(id) => patchRow(row.key, { product_id: id })}
                      products={products.filter(
                        (p) => p.product_id === row.product_id || !usedIds.includes(p.product_id),
                      )}
                    />
                    <Input
                      type="number" min="0" step="0.01" inputMode="decimal"
                      placeholder="0"
                      value={row.amount}
                      onChange={(e) => patchRow(row.key, { amount: e.target.value })}
                    />
                    {costEnabled && (
                      <Input
                        type="number" min="0" step="0.01" inputMode="decimal"
                        placeholder="0"
                        value={row.price}
                        onChange={(e) => patchRow(row.key, { price: e.target.value })}
                      />
                    )}
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => removeRow(row.key)}
                      disabled={rows.length === 1}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addRow} className="mt-1">
                  <Plus className="mr-1.5 h-4 w-4" /> Добавить ингредиент
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Сумма Xᵢ:</span>
                    <span className={cn('text-lg font-bold tabular-nums', sumValid ? 'text-success' : 'text-destructive')}>
                      {nf(sum, 2)} / {REQUIRED_SUM} г
                    </span>
                    {!sumValid && (
                      <span className="text-destructive flex items-center gap-1 text-xs">
                        <AlertTriangle className="h-3.5 w-3.5" /> сумма должна быть ровно 100 г
                      </span>
                    )}
                    {sumValid && <Check className="text-success h-4 w-4" />}
                  </div>
                  {costEnabled && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Стоимость:</span>
                      <span className="font-bold tabular-nums">
                        {totalCost !== null ? `${nf(totalCost, 2)} сом / 100 г` : '—'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {editing && (
                    <span className="text-muted-foreground mr-1 text-sm">
                      Правка: <span className="font-medium text-foreground">{editing.name}</span>
                    </span>
                  )}
                  {costEnabled && (
                    <OptimizeCostDialog
                      rows={rows}
                      products={products}
                      canOptimize={canOptimize}
                      optimizing={optimizing}
                      onOptimize={optimizeCost}
                    />
                  )}
                  <SaveRecipeDialog
                    referenceProteinId={refId}
                    editing={editing}
                    computable={canCompute}
                    items={rows
                      .filter((r) => r.product_id && r.amount !== '')
                      .map((r) => ({
                        product_id: r.product_id,
                        amount_g: parseFloat(r.amount.replace(',', '.')) || 0,
                        price_per_kg: costEnabled && r.price !== ''
                          ? parseFloat(r.price.replace(',', '.')) || null
                          : null,
                      }))}
                  />
                  <Button onClick={compute} disabled={!canCompute || computing} size="lg">
                    {computing
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Расчёт…</>
                      : <><CalcIcon className="mr-2 h-4 w-4" /> Рассчитать</>}
                  </Button>
                </div>
              </div>
              {!sumValid && (
                <p className="text-muted-foreground text-xs">
                  Пока сумма ≠ 100 г, расчёт заблокирован, но рецептуру можно сохранить как черновик.
                </p>
              )}
            </CardContent>
          </Card>

          {result && <Results result={result} />}
        </>
      )}
    </div>
  )
}
