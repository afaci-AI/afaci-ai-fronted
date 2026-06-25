'use client'

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Tooltip as RTooltip, LabelList,
} from 'recharts'
import { AlertTriangle, Check, Lightbulb, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { nf, COL } from '../_lib/utils'
import { StatCard } from './StatCard'
import { FormulaHint } from './FormulaHint'

function VerdictCard({ verdict }: { verdict: any }) {
  const styles: Record<string, { card: string; icon: string; badge: string; label: string }> = {
    good:     { card: 'border-success/40 bg-success/5',       icon: 'text-success',          badge: 'bg-success/15 text-success',          label: 'Высокое качество' },
    moderate: { card: 'border-warning/40 bg-warning/5',       icon: 'text-warning-foreground', badge: 'bg-warning/20 text-warning-foreground', label: 'Удовлетворительно' },
    poor:     { card: 'border-destructive/40 bg-destructive/5', icon: 'text-destructive',     badge: 'bg-destructive/15 text-destructive',   label: 'Низкое качество' },
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

export function Results({ result }: { result: any }) {
  const m = result.macro
  const q = result.quality
  const macroData = [
    { name: 'Белок',       value: m.protein, color: COL.protein },
    { name: 'Жир',         value: m.fat,     color: COL.fat },
    { name: 'Углеводы',    value: m.carb,    color: COL.carb },
    { name: 'Пищ. волокна', value: m.fiber,  color: COL.fiber },
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

      {result.verdict && <VerdictCard verdict={result.verdict} />}

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
                  <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
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
                    <Cell key={i} fill={d.color} stroke={d.is_min ? 'var(--destructive)' : 'transparent'} strokeWidth={d.is_min ? 2 : 0} />
                  ))}
                  <LabelList dataKey="score" position="top" fontSize={11} formatter={(v: any) => nf(v, 0)} />
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
                <TableRow key={a.name} className={cn(
                  a.is_min ? 'bg-destructive/15 border-l-[3px] border-destructive' : a.is_limiting ? 'bg-destructive/5' : '',
                )}>
                  <TableCell className={cn('font-medium', a.is_min && 'font-bold')}>{a.name}</TableCell>
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
                      <LabelList dataKey="bc" position="center" fontSize={13} fill="#fff" formatter={(v: any) => `БЦ ${nf(v, 1)}%`} />
                    </Bar>
                    <Bar dataKey="kras" stackId="a" fill={COL.kras} radius={[0, 6, 6, 0]}>
                      <LabelList dataKey="kras" position="center" fontSize={13} fill="#fff" formatter={(v: any) => `КРАС ${nf(v, 1)}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

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
