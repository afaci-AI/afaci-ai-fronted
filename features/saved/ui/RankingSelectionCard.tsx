'use client'

import { Sparkles, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { cn } from '@/shared/lib/utils'
import { nf } from '../model/ranking'
import type { UseRankingVm } from '../hooks/useRanking'

export function RankingSelectionCard({ vm }: { vm: UseRankingVm }) {
  const {
    selected,
    running,
    groupName,
    computable,
    draftCount,
    selectedIds,
    toggle,
    toggleAll,
    run,
  } = vm
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Выбор рецептур</CardTitle>
            <CardDescription>
              Отметьте рецептуры для сравнения (минимум 2).
              {draftCount > 0 &&
                ` Черновики без расчёта (${draftCount}) не участвуют.`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleAll}>
              {selectedIds.length === computable.length
                ? 'Снять выделение'
                : 'Выбрать все'}
            </Button>
            <Button onClick={run} disabled={running || selectedIds.length < 2}>
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Расчёт…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Ранжировать рецептуры
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {computable.map((r) => (
            <label
              key={r.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors',
                selected[r.id]
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-accent/40',
              )}
            >
              <Checkbox
                checked={!!selected[r.id]}
                onCheckedChange={() => toggle(r.id)}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{r.name}</span>
                  {groupName(r.group_id) && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {groupName(r.group_id)}
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  БЦ {nf(r.metrics?.bc)} · КРАС {nf(r.metrics?.kras)} · U{' '}
                  {nf(r.metrics?.U, 2)} · G {nf(r.metrics?.G, 2)}
                </div>
              </div>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
