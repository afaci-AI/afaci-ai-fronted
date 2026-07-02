'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, Trophy, Bookmark, Check } from 'lucide-react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { savedApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function nf(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export default function RankingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [recipes, setRecipes] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login?next=/ranking')
  }, [authLoading, isAuthenticated, router])

  const load = useCallback(async () => {
    try {
      const [rs, gs] = await Promise.all([savedApi.recipes(), savedApi.groups()])
      setRecipes(rs)
      setGroups(gs)
    } catch (e: any) {
      toast.error('Не удалось загрузить рецептуры', { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  const groupName = (id: string | null) => groups.find((g) => g.id === id)?.name ?? null
  // В ранжировании участвуют только рассчитанные рецептуры (у черновиков нет показателей).
  const computable = recipes.filter((r) => r.metrics?.bc != null)
  const draftCount = recipes.length - computable.length
  const selectedIds = Object.keys(selected).filter((id) => selected[id])

  const toggle = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  const toggleAll = () => {
    if (selectedIds.length === computable.length) setSelected({})
    else setSelected(Object.fromEntries(computable.map((r) => [r.id, true])))
  }

  const run = async () => {
    if (selectedIds.length < 2) {
      toast.error('Выберите минимум две рецептуры для сравнения')
      return
    }
    setRunning(true)
    try {
      const res = await savedApi.ranking({ recipe_ids: selectedIds })
      setResult(res)
      setTimeout(() => document.getElementById('ranking-results')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (e: any) {
      toast.error('Ранжирование не выполнено', { description: e.message })
    } finally {
      setRunning(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-32 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Проверка доступа…
      </div>
    )
  }

  const winner = result?.ranking?.find((x: any) => x.recipe_id === result.winner)
  const chartData = (result?.ranking ?? []).map((x: any) => ({
    name: x.name.length > 14 ? x.name.slice(0, 13) + '…' : x.name,
    composite: Math.round(x.composite * 100),
    isWinner: x.recipe_id === result.winner,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Sparkles className="h-7 w-7 text-primary" />
            Ранжирование рецептур
          </h1>
          <p className="mt-2 text-muted-foreground">
            Выберите сохранённые рецептуры — программа определит лучшую по показателям
            БЦ, КРАС, U и G и построит градацию от лучшей к худшей.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/saved-recipes"><Bookmark className="mr-1.5 h-4 w-4" /> К рецептурам</Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-20 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Загрузка…
        </div>
      ) : computable.length < 2 ? (
        <Card>
          <CardContent className="text-muted-foreground py-16 text-center">
            Для ранжирования нужно минимум две рассчитанные рецептуры. Сейчас их{' '}
            {computable.length}
            {draftCount > 0 && ` (черновиков без расчёта: ${draftCount})`}. Сохраните рецептуры с
            расчётом в{' '}
            <Link href="/calculator" className="text-primary underline">калькуляторе</Link>.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Выбор рецептур */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Выбор рецептур</CardTitle>
                  <CardDescription>
                    Отметьте рецептуры для сравнения (минимум 2).
                    {draftCount > 0 && ` Черновики без расчёта (${draftCount}) не участвуют.`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={toggleAll}>
                    {selectedIds.length === computable.length ? 'Снять выделение' : 'Выбрать все'}
                  </Button>
                  <Button onClick={run} disabled={running || selectedIds.length < 2}>
                    {running
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Расчёт…</>
                      : <><Sparkles className="mr-2 h-4 w-4" /> Ранжировать рецептуры</>}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {computable.map((r) => (
                  <label
                    key={r.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors',
                      selected[r.id] ? 'border-primary bg-primary/5' : 'hover:bg-accent/40',
                    )}
                  >
                    <Checkbox checked={!!selected[r.id]} onCheckedChange={() => toggle(r.id)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{r.name}</span>
                        {groupName(r.group_id) && (
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            {groupName(r.group_id)}
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-xs">
                        БЦ {nf(r.metrics?.bc)} · КРАС {nf(r.metrics?.kras)} ·
                        U {nf(r.metrics?.V, 2)} · G {nf(r.metrics?.G, 2)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Результаты */}
          {result && winner && (
            <div id="ranking-results" className="space-y-6">
              <Card className="border-primary/40 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" /> Лучшая рецептура
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-2xl font-bold">{winner.name}</div>
                      {winner.group && (
                        <Badge variant="secondary" className="mt-1">{winner.group}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-center">
                      <BigMetric label="Балл" value={nf(winner.composite * 100, 0)} accent />
                      <BigMetric label="БЦ, %" value={nf(winner.bc)} />
                      <BigMetric label="КРАС, %" value={nf(winner.kras)} />
                      <BigMetric label="U" value={nf(winner.V, 2)} />
                      <BigMetric label="G" value={nf(winner.G, 2)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* График композитного балла */}
              <Card>
                <CardHeader>
                  <CardTitle>Композитный балл (0–100)</CardTitle>
                  <CardDescription>
                    Нормировка БЦ↑, КРАС↓, U↑, G↓ по выбранным рецептурам, равные веса.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 16, right: 8, bottom: 8, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Bar dataKey="composite" radius={[4, 4, 0, 0]}>
                          {chartData.map((d: any, i: number) => (
                            <Cell key={i} fill={d.isWinner ? 'var(--success)' : 'var(--chart-1)'} />
                          ))}
                          <LabelList dataKey="composite" position="top" style={{ fontSize: 11 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Градация */}
              <Card>
                <CardHeader>
                  <CardTitle>Градация рецептур: от лучшей к худшей</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Рецептура</TableHead>
                        <TableHead className="text-right">БЦ, %</TableHead>
                        <TableHead className="text-right">КРАС, %</TableHead>
                        <TableHead className="text-right">U</TableHead>
                        <TableHead className="text-right">G</TableHead>
                        <TableHead className="text-right">Балл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.ranking.map((x: any) => (
                        <TableRow
                          key={x.recipe_id}
                          className={cn(x.recipe_id === result.winner && 'bg-success/10')}
                        >
                          <TableCell className="font-medium">
                            {x.rank === 1 ? (
                              <span className="text-success inline-flex items-center gap-1">
                                <Check className="h-4 w-4" />1
                              </span>
                            ) : x.rank}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{x.name}</span>
                            {x.group && <span className="text-muted-foreground ml-1.5 text-xs">· {x.group}</span>}
                          </TableCell>
                          <TableCell className="text-right">{nf(x.bc)}</TableCell>
                          <TableCell className="text-right">{nf(x.kras)}</TableCell>
                          <TableCell className="text-right">{nf(x.V, 2)}</TableCell>
                          <TableCell className="text-right">{nf(x.G, 2)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {nf(x.composite * 100, 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function BigMetric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className={cn('text-xl font-bold', accent && 'text-primary')}>{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  )
}
