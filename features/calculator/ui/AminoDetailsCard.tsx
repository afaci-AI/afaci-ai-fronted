'use client'

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  LabelList,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/card'
import { nf, COL } from '../model/utils'
import { QualityCard } from '../ui/ResultParts'
import type { UseResultsViewVm } from '../hooks/useResultsView'

export function AminoDetailsCard({ vm }: { vm: UseResultsViewVm }) {
  const { q, utilData, bcData } = vm
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Качественные показатели</CardTitle>
        <CardDescription>
          Сбалансированность и реализуемость аминокислотного состава
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QualityCard
            label="КРАС"
            value={`${nf(q.kras, 1)} %`}
            hint="Коэффициент различий аминокислотного скора: средний «избыток» НАК над лимитирующей. Чем меньше — тем сбалансированнее."
          />
          <QualityCard
            label="Биологическая ценность (БЦ)"
            value={`${nf(q.bc, 1)} %`}
            hint="БЦ = 100 − КРАС. Доля белка, усваиваемого организмом."
          />
          <QualityCard
            label="Коэф. утилитарности U"
            value={nf(q.U, 2)}
            hint="Сбалансированность НАК относительно лимитирующей (0…1). Ближе к 1 — лучше."
          />
          <QualityCard
            label="Сопоставимая избыточность G"
            value={`${nf(q.G, 2)}`}
            hint="Суммарная избыточность незаменимых аминокислот, не используемых на пластические нужды, г/100 г белка."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-muted-foreground mb-2 text-sm font-medium">
              Биологическая ценность и потери (БЦ + КРАС = 100%)
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bcData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" hide />
                  <RTooltip
                    formatter={(v, n) => [
                      `${nf(Number(v), 1)} %`,
                      n === 'bc' ? 'БЦ' : 'КРАС',
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--popover)',
                    }}
                  />
                  <Bar
                    dataKey="bc"
                    stackId="a"
                    fill={COL.bc}
                    radius={[6, 0, 0, 6]}
                  >
                    <LabelList
                      dataKey="bc"
                      position="center"
                      fontSize={13}
                      fill="#fff"
                      formatter={(v: number) => `БЦ ${nf(Number(v), 1)}%`}
                    />
                  </Bar>
                  <Bar
                    dataKey="kras"
                    stackId="a"
                    fill={COL.kras}
                    radius={[0, 6, 6, 0]}
                  >
                    <LabelList
                      dataKey="kras"
                      position="center"
                      fontSize={13}
                      fill="#fff"
                      formatter={(v: number) => `КРАС ${nf(Number(v), 1)}%`}
                    />
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
                <BarChart
                  data={utilData}
                  margin={{ top: 6, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  />
                  <RTooltip
                    formatter={(v) => [nf(Number(v), 2), 'αⱼ']}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--popover)',
                    }}
                  />
                  <Bar dataKey="utility" radius={[3, 3, 0, 0]}>
                    {utilData.map((d, i: number) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
