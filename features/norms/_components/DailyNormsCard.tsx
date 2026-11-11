'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { nf } from '../_lib/format'
import type { DailyNorms } from '../api'
import { NormsInfoButton } from './NormsInfoButton'
import { SourceLink } from './SourceLink'

/**
 * Таблица «Нутриент — Содержание в 100 г — Норма в сутки — Доля от нормы».
 * Все значения приходят с backend; клиент их не считает.
 */
export function DailyNormsCard({
  data,
  subject,
}: {
  data: DailyNorms
  /** Что описывает таблица: «продукта» или «рецептуры». */
  subject: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Суточные нормы</CardTitle>
            <CardDescription>
              Содержание в 100 г {subject} и доля от усреднённой суточной нормы
              взрослого человека
            </CardDescription>
          </div>
          <NormsInfoButton data={data} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Нутриент</TableHead>
              <TableHead className="text-right">В 100 г</TableHead>
              <TableHead className="text-right">Норма в сутки</TableHead>
              <TableHead className="text-right">Доля от нормы</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.norms.map((row) => {
              const digits = row.key === 'energy' ? 0 : 1
              return (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.amount === null
                      ? '—'
                      : `${nf(row.amount, digits)} ${row.unit}`}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {nf(row.norm, 0)} {row.unit}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.percent === null ? '—' : `${nf(row.percent, 1)} %`}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <p className="text-muted-foreground text-xs">
          Норма усреднённая, а не индивидуальная: реальная потребность зависит
          от пола, возраста и активности.
          {data.sources.length > 0 ? ' Источник: ' : null}
          {data.sources.map((source, index) => (
            <span key={source.id}>
              {index > 0 ? '; ' : null}
              <SourceLink source={source}>
                {source.title.split('. ')[0]}
              </SourceLink>
            </span>
          ))}
          .
        </p>
      </CardContent>
    </Card>
  )
}
