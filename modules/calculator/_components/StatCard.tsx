'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  accent?: 'min' | 'good' | 'primary'
  icon?: LucideIcon
}) {
  const ring =
    accent === 'min'
      ? 'border-destructive/40 bg-destructive/5'
      : accent === 'good'
        ? 'border-success/40 bg-success/5'
        : 'border-primary/30 bg-primary/5'
  return (
    <div className={cn('rounded-lg border p-4', ring)}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="text-muted-foreground mt-0.5 text-xs">{sub}</div>}
    </div>
  )
}
