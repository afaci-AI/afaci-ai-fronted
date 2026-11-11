import { Lightbulb } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import type { ComputeVerdict } from '../api'
import { FormulaHint } from './FormulaHint'

export function VerdictCard({ verdict }: { verdict: ComputeVerdict }) {
  const styles: Record<
    string,
    { card: string; icon: string; badge: string; label: string }
  > = {
    complete: {
      card: 'border-success/40 bg-success/5',
      icon: 'text-success',
      badge: 'bg-success/15 text-success',
      label: 'Полноценный по эталону',
    },
    incomplete: {
      card: 'border-warning/40 bg-warning/5',
      icon: 'text-warning-foreground',
      badge: 'bg-warning/20 text-warning-foreground',
      label: 'Неполноценный по эталону',
    },
  }
  styles.unconfirmed = {
    card: 'border-border bg-muted/30',
    icon: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
    label: 'Не подтверждено: мало данных',
  }
  // Незнакомый level (новая версия backend) показываем нейтрально.
  const s = styles[verdict.level] ?? {
    card: 'border-border bg-muted/30',
    icon: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
    label: '',
  }
  return (
    <Card className={cn('border', s.card)}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <Lightbulb className={cn('h-5 w-5', s.icon)} />
          Заключение: {verdict.headline}
          {s.label ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                s.badge,
              )}
            >
              {s.label}
            </span>
          ) : null}
        </CardTitle>
        <CardDescription>
          Оценка по аминокислотному составу в сравнении с выбранным эталоном
        </CardDescription>
        {verdict.experimental_note ? (
          <p
            role="note"
            className="rounded-md border border-dashed border-warning/60 bg-warning/10 px-3 py-2 text-xs text-warning-foreground"
          >
            {verdict.experimental_note}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {verdict.points.map((p: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span
                className={cn(
                  'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                  s.icon.replace('text-', 'bg-'),
                )}
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {verdict.criterion ||
        verdict.explanation?.length ||
        verdict.reference?.source ? (
          <details className="mt-4 rounded-md border px-3 py-2 text-sm">
            <summary className="cursor-pointer font-medium">
              Почему такой вывод
            </summary>
            <div className="mt-3 space-y-3">
              {verdict.criterion ? (
                <div>
                  <p className="font-medium">Правило сравнения</p>
                  <p className="text-muted-foreground">{verdict.criterion}</p>
                </div>
              ) : null}
              {verdict.reference?.source ? (
                <div>
                  <p className="font-medium">Источник эталона</p>
                  <p>{verdict.reference.source.title}</p>
                  <p className="text-muted-foreground">
                    {[
                      verdict.reference.source.authors,
                      verdict.reference.source.year,
                      verdict.reference.source.location,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {verdict.reference.source.url ? (
                    <a
                      href={verdict.reference.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Открыть источник
                    </a>
                  ) : null}
                </div>
              ) : null}
              {verdict.explanation?.map((row) => (
                <div key={row.code}>
                  <p className="font-medium">
                    {row.code} — {row.title}: {row.value}
                    {row.unit ? ` ${row.unit}` : ''}
                  </p>
                  <p className="text-muted-foreground">{row.text}</p>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function QualityCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium uppercase tracking-wide">
        {label}
        <FormulaHint>
          <p className="text-muted-foreground">{hint}</p>
        </FormulaHint>
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  )
}
