import { cn } from '@/shared/lib/utils'

export function BigMetric({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div className={cn('text-xl font-bold', accent && 'text-primary')}>
        {value}
      </div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  )
}
