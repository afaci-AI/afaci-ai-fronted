'use client'

import {
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip as RTooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { nf } from '../model/utils'
import { FormulaHint } from './FormulaHint'
import type { UseResultsViewVm } from '../hooks/useResultsView'

export function AminoScoreCard({ vm }: { vm: UseResultsViewVm }) {
  const { m, macroData } = vm
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Массовая доля основных компонентов
          <FormulaHint>
            <p className="font-medium">S = Σ(Sᵢ · Xᵢ) ÷ 100</p>
            <p className="text-muted-foreground mt-1">
              Доля компонента — сумма вкладов каждого ингредиента (его
              содержание × масса), делённая на 100.
            </p>
          </FormulaHint>
        </CardTitle>
        <CardDescription>
          Белки, жиры, углеводы и пищевые волокна, г на 100 г продукта
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {macroData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip
                  formatter={(v, n) => [`${nf(Number(v), 2)} г`, n]}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--popover)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {macroData.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ background: d.color }}
                  />
                  {d.name}
                </span>
                <span className="font-semibold tabular-nums">
                  {nf(d.value, 1)} г
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground text-sm">
                Соотношение белок : жир
              </span>
              <Badge variant="secondary" className="text-sm">
                1 : {nf(m.protein_fat_ratio, 2)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
