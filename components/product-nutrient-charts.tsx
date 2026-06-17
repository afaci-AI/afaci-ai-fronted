'use client'

import { useMemo } from 'react'
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { Nutrient, NutrientName, NutrientType, Unit } from '@/lib/types'

interface Props {
  nutrients: Nutrient[]
  nutrientNames: NutrientName[]
  nutrientTypes: NutrientType[]
  units: Unit[]
}

// Pick the macro nutrient whose name matches the keyword, preferring the
// shortest/most generic name (e.g. "Жиры" over "Жиры насыщенные").
function findMacro(
  nutrients: Nutrient[],
  nutrientNames: NutrientName[],
  match: (name: string) => boolean,
) {
  const candidates = nutrients
    .map((n) => ({ n, name: nutrientNames.find((x) => x.id === n.nutrient_name_id)?.name ?? '' }))
    .filter(({ name }) => match(name.toLowerCase()))
    .sort((a, b) => a.name.length - b.name.length)
  return candidates[0]?.n
}

export function ProductNutrientCharts({ nutrients, nutrientNames, nutrientTypes, units }: Props) {
  const nameOf = (id: string) => nutrientNames.find((x) => x.id === id)?.name ?? '—'
  const unitOf = (id: string) => units.find((x) => x.id === id)?.name ?? ''

  // --- БЖУ for the donut ---
  const bzhu = useMemo(() => {
    const protein = findMacro(nutrients, nutrientNames, (n) => n.includes('белок') || n.includes('белк'))
    const fat = findMacro(nutrients, nutrientNames, (n) => n.includes('жир') && !n.includes('кислот'))
    const carb = findMacro(nutrients, nutrientNames, (n) => n.includes('углевод'))
    return [
      { key: 'protein', label: 'Белки', value: protein?.quantity ?? 0 },
      { key: 'fat', label: 'Жиры', value: fat?.quantity ?? 0 },
      { key: 'carb', label: 'Углеводы', value: carb?.quantity ?? 0 },
    ].filter((d) => d.value > 0)
  }, [nutrients, nutrientNames])

  const bzhuConfig: ChartConfig = {
    protein: { label: 'Белки', color: 'var(--chart-1)' },
    fat: { label: 'Жиры', color: 'var(--chart-4)' },
    carb: { label: 'Углеводы', color: 'var(--chart-2)' },
  }

  // --- Sections grouped by nutrient type, then split by unit (so bar scales stay comparable) ---
  const sections = useMemo(() => {
    const typeGroups = nutrientTypes
      .map((type) => ({
        title: type.name,
        items: nutrients.filter((n) => {
          const nm = nutrientNames.find((x) => x.id === n.nutrient_name_id)
          return nm?.nutrient_type_id === type.id
        }),
      }))
      .filter((g) => g.items.length > 0)

    const ungrouped = nutrients.filter((n) => {
      const nm = nutrientNames.find((x) => x.id === n.nutrient_name_id)
      return !nm?.nutrient_type_id || !nutrientTypes.find((t) => t.id === nm.nutrient_type_id)
    })
    if (ungrouped.length > 0) typeGroups.push({ title: 'Без типа', items: ungrouped })

    // For each type, split into one chart per distinct unit.
    return typeGroups.map((group) => {
      const byUnit = new Map<string, Nutrient[]>()
      for (const n of group.items) {
        const arr = byUnit.get(n.unit_id) ?? []
        arr.push(n)
        byUnit.set(n.unit_id, arr)
      }
      const charts = Array.from(byUnit.entries()).map(([unitId, items]) => ({
        unit: unitOf(unitId),
        data: items
          .map((n) => ({ name: nameOf(n.nutrient_name_id), value: n.quantity }))
          .sort((a, b) => b.value - a.value),
      }))
      return { title: group.title, charts }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nutrients, nutrientNames, nutrientTypes, units])

  const barConfig: ChartConfig = { value: { label: 'Количество', color: 'var(--chart-1)' } }

  return (
    <div className="space-y-6">
      {/* БЖУ donut */}
      {bzhu.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Соотношение БЖУ</CardTitle>
            <CardDescription>Белки, жиры и углеводы на 100 г продукта</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bzhuConfig} className="mx-auto aspect-square max-h-[260px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                <Pie data={bzhu} dataKey="value" nameKey="label" innerRadius={60} strokeWidth={2}>
                  {bzhu.map((d) => (
                    <Cell key={d.key} fill={`var(--color-${d.key})`} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="label" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Grouped horizontal bars */}
      <Card>
        <CardHeader>
          <CardTitle>Нутриенты</CardTitle>
          <CardDescription>Пищевая ценность на 100 г продукта</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">{section.title}</Badge>
              </div>
              <div className="space-y-6">
                {section.charts.map((chart, i) => (
                  <div key={i}>
                    {chart.unit && (
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs font-semibold text-foreground">
                          ед. изм.: {chart.unit}
                        </Badge>
                      </div>
                    )}
                    <ChartContainer
                      config={barConfig}
                      className="aspect-auto w-full"
                      style={{ height: chart.data.length * 36 + 16 }}
                    >
                      <BarChart accessibilityLayer data={chart.data} layout="vertical" margin={{ right: 48, left: 8 }}>
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={150}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                          <LabelList
                            dataKey="value"
                            position="right"
                            className="fill-foreground"
                            fontSize={12}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
