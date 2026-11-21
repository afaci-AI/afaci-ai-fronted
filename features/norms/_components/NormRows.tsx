import { TableBody, TableCell, TableRow } from '@/shared/ui/table'
import { nf } from '../_lib/format'
import type { DailyNormRow } from '../api'

/** Знаков после запятой: энергия — целые, малые значения — больше знаков. */
function digitsFor(row: DailyNormRow): number {
  if (row.key === 'energy') return 0
  const amount = Math.abs(row.amount ?? 0)
  if (amount > 0 && amount < 1) return 3
  return amount < 10 ? 2 : 1
}

function withUnit(value: string, unit: string | null): string {
  return unit ? `${value} ${unit}` : value
}

/** Строки «нутриент — содержание — норма — доля»; norm = null → «—». */
export function NormRows({
  rows,
  withNorms = true,
}: {
  rows: DailyNormRow[]
  withNorms?: boolean
}) {
  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.key}>
          <TableCell className="font-medium">
            {row.name}
            {row.kind === 'adequate' ? (
              <span className="text-muted-foreground block text-xs font-normal">
                адекватный уровень
              </span>
            ) : null}
          </TableCell>
          <TableCell className="text-right tabular-nums">
            {row.amount === null ? (
              '—'
            ) : (
              <>
                {withUnit(nf(row.amount, digitsFor(row)), row.unit)}
                {row.partial ? (
                  <span title="Значение известно не у всех ингредиентов">
                    {' *'}
                  </span>
                ) : null}
              </>
            )}
          </TableCell>
          {withNorms ? (
            <>
              <TableCell className="text-right tabular-nums">
                {row.norm === null ? '—' : withUnit(nf(row.norm, 0), row.unit)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.percent === null ? '—' : `${nf(row.percent, 1)} %`}
              </TableCell>
            </>
          ) : null}
        </TableRow>
      ))}
    </TableBody>
  )
}
