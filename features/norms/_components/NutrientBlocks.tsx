'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Table, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import type { DailyNormRow, DailyNorms } from '../api'
import { NormRows } from './NormRows'
import { NormsInfoButton } from './NormsInfoButton'
import { SourceLink } from './SourceLink'

function NormsHead({ withNorms }: { withNorms: boolean }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Нутриент</TableHead>
        <TableHead className="text-right">В 100 г</TableHead>
        {withNorms ? (
          <>
            <TableHead className="text-right">Норма в сутки</TableHead>
            <TableHead className="text-right">Доля от нормы</TableHead>
          </>
        ) : null}
      </TableRow>
    </TableHeader>
  )
}

/** Макросостав: энергия, белки, жиры, углеводы, волокна и доля от нормы. */
export function MacroCard({
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
            <CardTitle className="text-lg">Макросостав</CardTitle>
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
          <NormsHead withNorms />
          <NormRows rows={data.macro} />
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

/** Микросостав: минералы; нет данных ни у кого — блок не показывается. */
export function MicroCard({
  rows,
  subject,
}: {
  rows: DailyNormRow[]
  subject: string
}) {
  if (rows.length === 0) return null
  const hasPartial = rows.some((row) => row.partial)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Микросостав</CardTitle>
        <CardDescription>
          Минеральный состав: содержание в 100 г {subject}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Table>
          <NormsHead withNorms />
          <NormRows rows={rows} />
        </Table>
        {hasPartial ? (
          <p className="text-muted-foreground text-xs">
            * Значение известно не у всех ингредиентов, сумма неполная.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/** Прочее: влага, зольность и т. п.; без норм, свёрнуто по умолчанию. */
export function OtherCard({
  rows,
  subject,
}: {
  rows: DailyNormRow[]
  subject: string
}) {
  if (rows.length === 0) return null
  return (
    <Card>
      <CardContent className="pt-6">
        <details>
          <summary className="cursor-pointer text-lg font-semibold">
            Прочее
          </summary>
          <p className="text-muted-foreground mt-1 mb-3 text-sm">
            Содержание в 100 г {subject}, норм нет
          </p>
          <Table>
            <NormsHead withNorms={false} />
            <NormRows rows={rows} withNorms={false} />
          </Table>
        </details>
      </CardContent>
    </Card>
  )
}
