'use client'

import { Trophy, Check } from 'lucide-react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
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
import { BigMetric } from './RankingParts'
import { nf } from '../model/ranking'
import type { UseRankingVm } from '../hooks/useRanking'

export function RankingResults({ vm }: { vm: UseRankingVm }) {
  const { result, winner, chartData } = vm
  if (!result || !winner) return null
  return (
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
                <Badge variant="secondary" className="mt-1">
                  {winner.group}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-5 gap-4 text-center">
              <BigMetric
                label="Балл"
                value={nf(winner.composite * 100, 0)}
                accent
              />
              <BigMetric label="БЦ, %" value={nf(winner.bc)} />
              <BigMetric label="КРАС, %" value={nf(winner.kras)} />
              <BigMetric label="U" value={nf(winner.U, 2)} />
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
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 8, bottom: 8, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Bar dataKey="composite" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i: number) => (
                    <Cell
                      key={i}
                      fill={d.isWinner ? 'var(--success)' : 'var(--chart-1)'}
                    />
                  ))}
                  <LabelList
                    dataKey="composite"
                    position="top"
                    style={{ fontSize: 11 }}
                  />
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
              {result.ranking.map((x) => (
                <TableRow
                  key={x.recipe_id}
                  className={cn(
                    x.recipe_id === result.winner && 'bg-success/10',
                  )}
                >
                  <TableCell className="font-medium">
                    {x.rank === 1 ? (
                      <span className="text-success inline-flex items-center gap-1">
                        <Check className="h-4 w-4" />1
                      </span>
                    ) : (
                      x.rank
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{x.name}</span>
                    {x.group && (
                      <span className="text-muted-foreground ml-1.5 text-xs">
                        · {x.group}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{nf(x.bc)}</TableCell>
                  <TableCell className="text-right">{nf(x.kras)}</TableCell>
                  <TableCell className="text-right">{nf(x.U, 2)}</TableCell>
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
  )
}
