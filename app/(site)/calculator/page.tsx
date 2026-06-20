'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Calculator as CalcIcon, Plus, Trash2, Info, Loader2, Zap, FlaskConical,
  AlertTriangle, Check, ChevronsUpDown, RotateCcw, Sparkles, Lightbulb,
} from 'lucide-react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Tooltip as RTooltip, LabelList,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { calculatorApi, tableApi } from '@/lib/api'

// ---------------------------------------------------------------------------
// Вспомогательные функции
// ---------------------------------------------------------------------------
const REQUIRED_SUM = 100
const COL = {
  protein: 'var(--chart-1)',
  fat: 'var(--chart-4)',
  carb: 'var(--chart-2)',
  fiber: 'var(--chart-5)',
  score: 'var(--chart-1)',
  min: 'var(--destructive)',
  good: 'var(--success)',
  kras: 'var(--destructive)',
  bc: 'var(--success)',
}

function nf(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })
}

interface Row { key: number; product_id: string; amount: string }
let rowSeq = 1

// ---------------------------------------------------------------------------
// Комбобокс выбора продукта
// ---------------------------------------------------------------------------
function ProductCombobox({
  value, onChange, products,
}: {
  value: string
  onChange: (id: string) => void
  products: any[]
}) {
  const [open, setOpen] = useState(false)
  const selected = products.find((p) => p.product_id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="truncate">
              {selected.product_name}
              <span className="text-muted-foreground ml-1.5 text-xs">
                · {selected.region_name}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Выберите сырьё…</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(val, search) => (val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
        >
          <CommandInput placeholder="Поиск сырья…" />
          <CommandList>
            <CommandEmpty>Ничего не найдено.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.product_id}
                  value={`${p.product_name} ${p.region_name} ${p.subcategory_name ?? ''} ${p.product_id}`}
                  onSelect={() => { onChange(p.product_id); setOpen(false) }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === p.product_id ? 'opacity-100' : 'opacity-0')}
                  />
                  <div className="flex flex-col">
                    <span>{p.product_name}</span>
                    <span className="text-muted-foreground text-xs">
                      {p.region_name}{p.subcategory_name ? ` · ${p.subcategory_name}` : ''}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Маленький поповер с формулой (скрываем «структуру формул» по умолчанию)
function FormulaHint({ children }: { children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground inline-flex items-center" type="button">
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm" align="start">
        {children}
      </PopoverContent>
    </Popover>
  )
}

function StatCard({
  label, value, sub, accent, icon: Icon,
}: {
  label: string; value: React.ReactNode; sub?: string; accent?: 'min' | 'good' | 'primary'; icon?: any
}) {
  const ring =
    accent === 'min' ? 'border-destructive/40 bg-destructive/5'
      : accent === 'good' ? 'border-success/40 bg-success/5'
        : 'border-primary/30 bg-primary/5'
  return (
    <div className={cn('rounded-lg border p-4', ring)}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
        {Icon && <Icon className="h-3.5 w-3.5" />}{label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="text-muted-foreground mt-0.5 text-xs">{sub}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Страница
// ---------------------------------------------------------------------------
export default function CalculatorPage() {
  const [references, setReferences] = useState<any[]>([])
  const [refId, setRefId] = useState<string>('')
  const [products, setProducts] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [rows, setRows] = useState<Row[]>([{ key: rowSeq++, product_id: '', amount: '' }])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const [refs, prods, recs] = await Promise.all([
          calculatorApi.referenceProteins(),
          tableApi.products(),
          calculatorApi.recipes(),
        ])
        setReferences(refs)
        setProducts(prods)
        setRecipes(recs)
        const def = refs.find((r: any) => r.is_default) ?? refs[0]
        if (def) setRefId(def.id)
      } catch (e: any) {
        toast.error('Не удалось загрузить данные', { description: e.message })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const selectedRef = references.find((r) => r.id === refId)

  const sum = useMemo(
    () => rows.reduce((s, r) => s + (parseFloat(r.amount.replace(',', '.')) || 0), 0),
    [rows],
  )
  const allSelected = rows.length > 0 && rows.every((r) => r.product_id && r.amount !== '')
  const sumValid = Math.abs(sum - REQUIRED_SUM) < 0.01
  const canCompute = allSelected && sumValid && !!refId

  const usedIds = rows.map((r) => r.product_id).filter(Boolean)

  const addRow = () => setRows((rs) => [...rs, { key: rowSeq++, product_id: '', amount: '' }])
  const removeRow = (key: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs))
  const patchRow = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const loadExample = () => {
    const rec = recipes[0]
    if (!rec) return
    setRows(rec.items.map((it: any) => ({
      key: rowSeq++, product_id: it.product_id, amount: String(it.amount_g),
    })))
    const def = references.find((r) => r.is_default) ?? references[0]
    if (def) setRefId(def.id)
    setResult(null)
    toast.success(`Загружена рецептура: ${rec.name}`)
  }

  const reset = () => {
    setRows([{ key: rowSeq++, product_id: '', amount: '' }])
    setResult(null)
  }

  const compute = async () => {
    setComputing(true)
    try {
      const body = {
        reference_protein_id: refId,
        items: rows.map((r) => ({
          product_id: r.product_id,
          amount_g: parseFloat(r.amount.replace(',', '.')) || 0,
        })),
      }
      const res = await calculatorApi.compute(body)
      setResult(res)
      setTimeout(() => document.getElementById('calc-results')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (e: any) {
      toast.error('Расчёт не выполнен', { description: e.message })
    } finally {
      setComputing(false)
    }
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
          {/* ---------------- ВВОД ---------------- */}
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
              {/* Эталон ФАО */}
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

              {/* Ингредиенты */}
              <div className="space-y-2">
                <div className="text-muted-foreground grid grid-cols-[1fr_140px_40px] gap-2 px-1 text-xs font-medium uppercase tracking-wide">
                  <span>Сырьё</span><span>Xᵢ, г</span><span />
                </div>
                {rows.map((row) => (
                  <div key={row.key} className="grid grid-cols-[1fr_140px_40px] items-center gap-2">
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

              {/* Сумма + кнопка */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Сумма Xᵢ:</span>
                  <span className={cn('text-lg font-bold tabular-nums',
                    sumValid ? 'text-success' : 'text-destructive')}>
                    {nf(sum, 2)} / {REQUIRED_SUM} г
                  </span>
                  {!sumValid && (
                    <span className="text-destructive flex items-center gap-1 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      сумма должна быть ровно 100 г
                    </span>
                  )}
                  {sumValid && <Check className="text-success h-4 w-4" />}
                </div>
                <Button onClick={compute} disabled={!canCompute || computing} size="lg">
                  {computing
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Расчёт…</>
                    : <><CalcIcon className="mr-2 h-4 w-4" /> Рассчитать</>}
                </Button>
              </div>
              {!sumValid && (
                <p className="text-muted-foreground text-xs">
                  Пока сумма ингредиентов не равна 100 г, расчёт заблокирован.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ---------------- РЕЗУЛЬТАТЫ ---------------- */}
          {result && <Results result={result} />}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Кнопка «почему этот эталон» + Таблица 4
// ---------------------------------------------------------------------------
function ReferenceInfoButton({ reference }: { reference: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Info className="h-4 w-4" /> Почему этот эталон?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Эталонный белок «{reference.name}»
          </DialogTitle>
          <DialogDescription>Почему он выбран как эталон и что это значит</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>{reference.description}</p>
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-muted-foreground mb-1 text-xs">
              Аминокислотный скор показывает, насколько белок продукта приближается к эталону:
            </p>
            <p className="font-medium">Скор C = (НАК продукта ÷ НАК эталона) × 100&nbsp;%</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Эталон — «идеальный» белок с оптимально сбалансированным составом незаменимых
              аминокислот (НАК). Минимальный скор задаёт лимитирующую кислоту и биологическую ценность.
            </p>
          </div>
          <div>
            <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Таблица 4 — профиль эталона, г/100 г белка
            </div>
            <div className="grid grid-cols-4 gap-2">
              {reference.values.map((v: any) => (
                <div key={v.amino_acid} className="rounded-md border p-2 text-center">
                  <div className="text-muted-foreground text-[11px]">{v.amino_acid}</div>
                  <div className="font-semibold">{nf(v.value, 1)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Блок результатов
// ---------------------------------------------------------------------------
function Results({ result }: { result: any }) {
  const m = result.macro
  const q = result.quality
  const macroData = [
    { name: 'Белок', value: m.protein, color: COL.protein },
    { name: 'Жир', value: m.fat, color: COL.fat },
    { name: 'Углеводы', value: m.carb, color: COL.carb },
    { name: 'Пищ. волокна', value: m.fiber, color: COL.fiber },
  ]
  const sortedAmino = [...result.amino_acids].sort((a: any, b: any) => a.score - b.score)
  const scoreData = sortedAmino.map((a: any) => ({
    name: a.name, score: a.score, m_j: a.m_j, is_min: a.is_min,
    color: a.is_min ? COL.min : (a.score >= 100 ? COL.good : COL.score),
  }))
  const utilData = sortedAmino
    .filter((a: any) => a.utility != null)
    .map((a: any) => ({ name: a.name, utility: a.utility, is_min: a.is_min, color: a.is_min ? COL.min : COL.score }))
  const bcData = [{ name: 'белок', bc: q.bc, kras: q.kras }]

  return (
    <div id="calc-results" className="space-y-6">
      {/* Сводка */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Энергоценность" icon={Zap}
          value={<>{nf(result.energy_kcal, 0)} <span className="text-base font-normal text-muted-foreground">ккал/100 г</span></>}
          accent="primary"
        />
        <StatCard
          label="Лимитирующая НАК (Cₘᵢₙ)" icon={AlertTriangle}
          value={result.c_min ? `${result.c_min.name} · ${nf(result.c_min.score, 1)}%` : '—'}
          sub={`Лимитирующих НАК: ${result.limiting_count}`}
          accent="min"
        />
        <StatCard
          label="Биологическая ценность" icon={Check}
          value={<>{nf(q.bc, 1)}<span className="text-base font-normal text-muted-foreground"> %</span></>}
          accent="good"
        />
        <StatCard
          label="Коэф. утилитарности V"
          value={nf(q.V, 2)}
          sub={`Избыточность G = ${nf(q.G, 2)} г/100 г белка`}
          accent="primary"
        />
      </div>

      {result.warnings?.length > 0 && (
        <div className="border-warning/40 bg-warning/5 text-warning-foreground flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{result.warnings.map((w: string, i: number) => <p key={i}>{w}</p>)}</div>
        </div>
      )}

      {/* Заключение (автоматический вердикт) */}
      {result.verdict && <VerdictCard verdict={result.verdict} />}

      {/* Таблица 1 — Рецептура */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Таблица 1 — Рецептура</CardTitle>
          <CardDescription>Состав образца на 100 г</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сырьё</TableHead>
                <TableHead>Область</TableHead>
                <TableHead>Подкатегория</TableHead>
                <TableHead className="text-right">Xᵢ, г</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.recipe.map((it: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{it.name}</TableCell>
                  <TableCell className="text-muted-foreground">{it.region ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{it.subcategory ?? '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{nf(it.amount_g, 2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">Σ</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{nf(result.sum_g, 1)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Массовая доля основных компонентов (БЖУ + ПВ) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Массовая доля основных компонентов
            <FormulaHint>
              <p className="font-medium">S = Σ(Sᵢ · Xᵢ) ÷ 100</p>
              <p className="text-muted-foreground mt-1">
                Доля компонента — сумма вкладов каждого ингредиента (его содержание × масса), делённая на 100.
              </p>
            </FormulaHint>
          </CardTitle>
          <CardDescription>Белки, жиры, углеводы и пищевые волокна, г на 100 г продукта</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}
                  >
                    {macroData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <RTooltip
                    formatter={(v: any, n: any) => [`${nf(v, 2)} г`, n]}
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--popover)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {macroData.map((d) => (
                <div key={d.name} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-semibold tabular-nums">{nf(d.value, 1)} г</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground text-sm">Соотношение белок : жир</span>
                <Badge variant="secondary" className="text-sm">1 : {nf(m.protein_fat_ratio, 2)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица 5 — НАК и аминокислотный скор */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Таблица 5 — НАК суммарного белка и аминокислотный скор
            <FormulaHint>
              <p className="font-medium">Mⱼ = Σ(Sᵢ·Xᵢ·Mᵢⱼ) ÷ Σ(Sᵢ·Xᵢ)</p>
              <p className="font-medium mt-1">Скор C = Mⱼ ÷ эталон × 100&nbsp;%</p>
              <p className="text-muted-foreground mt-1">
                Эталон — «{result.reference.name}». Минимальный скор = лимитирующая аминокислота.
              </p>
            </FormulaHint>
          </CardTitle>
          <CardDescription>
            Скор каждой незаменимой аминокислоты относительно эталона «{result.reference.name}».
            Пунктир — уровень эталона (100%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <RTooltip
                  formatter={(v: any) => [`${nf(v, 1)} %`, 'Скор C']}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--popover)' }}
                />
                <ReferenceLine y={100} stroke="var(--muted-foreground)" strokeDasharray="5 4"
                  label={{ value: 'эталон 100%', position: 'right', fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {scoreData.map((d: any, i: number) => (
                    <Cell
                      key={i}
                      fill={d.color}
                      stroke={d.is_min ? 'var(--destructive)' : 'transparent'}
                      strokeWidth={d.is_min ? 2 : 0}
                    />
                  ))}
                  <LabelList dataKey="score" position="top" fontSize={11}
                    formatter={(v: any) => nf(v, 0)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>НАК</TableHead>
                <TableHead className="text-right">Mⱼ, г/100 г белка</TableHead>
                <TableHead className="text-right">Скор C, %</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAmino.map((a: any) => (
                <TableRow
                  key={a.name}
                  className={cn(
                    a.is_min
                      ? 'bg-destructive/15 border-l-[3px] border-destructive'
                      : a.is_limiting
                        ? 'bg-destructive/5'
                        : '',
                  )}
                >
                  <TableCell className={cn('font-medium', a.is_min && 'font-bold')}>
                    {a.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{nf(a.m_j, 2)}</TableCell>
                  <TableCell className={cn(
                    'text-right font-semibold tabular-nums',
                    a.is_min ? 'text-destructive text-base font-bold' : a.score >= 100 ? 'text-success' : 'text-muted-foreground',
                  )}>
                    {nf(a.score, 1)}
                  </TableCell>
                  <TableCell>
                    {a.is_min
                      ? <Badge variant="destructive" className="font-semibold">Cₘᵢₙ — лимитирующая</Badge>
                      : a.is_limiting
                        ? <Badge variant="outline" className="text-destructive border-destructive/40">лимитирующая</Badge>
                        : <Badge variant="secondary">избыток</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {result.c_min && (
            <div className="border-destructive/40 bg-destructive/5 flex items-center gap-3 rounded-lg border p-4">
              <AlertTriangle className="text-destructive h-5 w-5 shrink-0" />
              <div>
                <div className="font-semibold">
                  Лимитирующая аминокислота (Cₘᵢₙ): {result.c_min.name} — {nf(result.c_min.score, 1)}%
                </div>
                <div className="text-muted-foreground text-sm">
                  Именно она ограничивает биологическую ценность белка. Всего скор ниже 100% у {result.limiting_count} НАК: {result.limiting.join(', ')}.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Качественные показатели */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Качественные показатели</CardTitle>
          <CardDescription>Сбалансированность и реализуемость аминокислотного состава</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QualityCard label="КРАС" value={`${nf(q.kras, 1)} %`}
              hint="Коэффициент различий аминокислотного скора: средний «избыток» НАК над лимитирующей. Чем меньше — тем сбалансированнее." />
            <QualityCard label="Биологическая ценность (БЦ)" value={`${nf(q.bc, 1)} %`}
              hint="БЦ = 100 − КРАС. Доля белка, усваиваемого организмом." />
            <QualityCard label="Коэф. утилитарности V" value={nf(q.V, 2)}
              hint="Сбалансированность НАК относительно лимитирующей (0…1). Ближе к 1 — лучше." />
            <QualityCard label="Сопоставимая избыточность G" value={`${nf(q.G, 2)}`}
              hint="Суммарная избыточность незаменимых аминокислот, не используемых на пластические нужды, г/100 г белка." />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* БЦ vs КРАС */}
            <div>
              <div className="text-muted-foreground mb-2 text-sm font-medium">
                Биологическая ценность и потери (БЦ + КРАС = 100%)
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bcData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <RTooltip
                      formatter={(v: any, n: any) => [`${nf(v, 1)} %`, n === 'bc' ? 'БЦ' : 'КРАС']}
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--popover)' }}
                    />
                    <Bar dataKey="bc" stackId="a" fill={COL.bc} radius={[6, 0, 0, 6]}>
                      <LabelList dataKey="bc" position="center" fontSize={13} fill="#fff"
                        formatter={(v: any) => `БЦ ${nf(v, 1)}%`} />
                    </Bar>
                    <Bar dataKey="kras" stackId="a" fill={COL.kras} radius={[0, 6, 6, 0]}>
                      <LabelList dataKey="kras" position="center" fontSize={13} fill="#fff"
                        formatter={(v: any) => `КРАС ${nf(v, 1)}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Коэффициенты утилитарности по НАК */}
            <div>
              <div className="text-muted-foreground mb-2 text-sm font-medium">
                Коэффициенты утилитарности αⱼ по аминокислотам
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={utilData} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <RTooltip
                      formatter={(v: any) => [nf(v, 2), 'αⱼ']}
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--popover)' }}
                    />
                    <Bar dataKey="utility" radius={[3, 3, 0, 0]}>
                      {utilData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function VerdictCard({ verdict }: { verdict: any }) {
  const styles: Record<string, { card: string; icon: string; badge: string; label: string }> = {
    good: { card: 'border-success/40 bg-success/5', icon: 'text-success', badge: 'bg-success/15 text-success', label: 'Высокое качество' },
    moderate: { card: 'border-warning/40 bg-warning/5', icon: 'text-warning-foreground', badge: 'bg-warning/20 text-warning-foreground', label: 'Удовлетворительно' },
    poor: { card: 'border-destructive/40 bg-destructive/5', icon: 'text-destructive', badge: 'bg-destructive/15 text-destructive', label: 'Низкое качество' },
  }
  const s = styles[verdict.level] ?? styles.moderate
  return (
    <Card className={cn('border', s.card)}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <Lightbulb className={cn('h-5 w-5', s.icon)} />
          Заключение: {verdict.headline}
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', s.badge)}>{s.label}</span>
        </CardTitle>
        <CardDescription>Автоматическая оценка качества белка по показателям расчёта</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {verdict.points.map((p: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', s.icon.replace('text-', 'bg-'))} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function QualityCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium uppercase tracking-wide">
        {label}
        <FormulaHint><p className="text-muted-foreground">{hint}</p></FormulaHint>
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  )
}
