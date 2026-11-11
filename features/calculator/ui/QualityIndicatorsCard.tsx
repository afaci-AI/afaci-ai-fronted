'use client'

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  LabelList,
} from 'recharts'
import { AlertTriangle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'
import { nf } from '../model/utils'
import { FormulaHint } from './FormulaHint'
import type { UseResultsViewVm } from '../hooks/useResultsView'

export function QualityIndicatorsCard({ vm }: { vm: UseResultsViewVm }) {
  const { sortedAmino, scoreData, result } = vm
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Таблица 5 — НАК суммарного белка и аминокислотный скор
          <FormulaHint>
            <p className="font-medium">Mⱼ = Σ(Sᵢ·Xᵢ·Mᵢⱼ) ÷ Σ(Sᵢ·Xᵢ)</p>
            <p className="font-medium mt-1">
              Скор C = Mⱼ ÷ эталон × 100&nbsp;%
            </p>
            <p className="text-muted-foreground mt-1">
              Эталон — «{result.reference.name}». Минимальный скор =
              лимитирующая аминокислота.
            </p>
          </FormulaHint>
        </CardTitle>
        <CardDescription>
          Скор каждой незаменимой аминокислоты относительно эталона «
          {result.reference.name}». Пунктир — уровень эталона (100%).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={scoreData}
              margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <RTooltip
                formatter={(v) => [`${nf(Number(v), 1)} %`, 'Скор C']}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--popover)',
                }}
              />
              <ReferenceLine
                y={100}
                stroke="var(--muted-foreground)"
                strokeDasharray="5 4"
                label={{
                  value: 'эталон 100%',
                  position: 'right',
                  fontSize: 11,
                  fill: 'var(--muted-foreground)',
                }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {scoreData.map((d, i: number) => (
                  <Cell
                    key={i}
                    fill={d.color}
                    stroke={d.is_min ? 'var(--destructive)' : 'transparent'}
                    strokeWidth={d.is_min ? 2 : 0}
                  />
                ))}
                <LabelList
                  dataKey="score"
                  position="top"
                  fontSize={11}
                  formatter={(v: number) => nf(Number(v), 0)}
                />
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
            {sortedAmino.map((a) => (
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
                <TableCell
                  className={cn('font-medium', a.is_min && 'font-bold')}
                >
                  {a.name}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {nf(a.m_j, 2)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold tabular-nums',
                    a.is_min
                      ? 'text-destructive text-base font-bold'
                      : a.score >= 100
                        ? 'text-success'
                        : 'text-muted-foreground',
                  )}
                >
                  {nf(a.score, 1)}
                </TableCell>
                <TableCell>
                  {a.is_min ? (
                    <Badge variant="destructive" className="font-semibold">
                      Cₘᵢₙ — лимитирующая
                    </Badge>
                  ) : a.is_limiting ? (
                    <Badge
                      variant="outline"
                      className="text-destructive border-destructive/40"
                    >
                      лимитирующая
                    </Badge>
                  ) : (
                    <Badge variant="secondary">избыток</Badge>
                  )}
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
                Лимитирующая аминокислота (Cₘᵢₙ): {result.c_min.name} —{' '}
                {nf(result.c_min.score, 1)}%
              </div>
              <div className="text-muted-foreground text-sm">
                Именно она ограничивает биологическую ценность белка. Всего скор
                ниже 100% у {result.limiting_count} НАК:{' '}
                {result.limiting.join(', ')}.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
