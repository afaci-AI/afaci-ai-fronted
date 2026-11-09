'use client'

import { AlertTriangle, Check, Zap } from 'lucide-react'
import { nf } from '../model/utils'
import type { ComputeResult } from '../api'
import { DailyNormsCard } from '@/features/norms'
import { StatCard } from './StatCard'
import { useResultsView } from '../hooks/useResultsView'
import { RecipeCompositionCard } from './RecipeCompositionCard'
import { AminoScoreCard } from './AminoScoreCard'
import { QualityIndicatorsCard } from './QualityIndicatorsCard'
import { AminoDetailsCard } from './AminoDetailsCard'
import { VerdictCard } from './ResultParts'

export function Results({ result }: { result: ComputeResult }) {
  const vm = useResultsView(result)
  const { q } = vm

  return (
    <div id="calc-results" className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Энергоценность"
          icon={Zap}
          value={
            <>
              {nf(result.energy_kcal, 0)}{' '}
              <span className="text-base font-normal text-muted-foreground">
                ккал/100 г
              </span>
            </>
          }
          accent="primary"
        />
        <StatCard
          label="Лимитирующая НАК (Cₘᵢₙ)"
          icon={AlertTriangle}
          value={
            result.c_min
              ? `${result.c_min.name} · ${nf(result.c_min.score, 1)}%`
              : '—'
          }
          sub={`Лимитирующих НАК: ${result.limiting_count}`}
          accent="min"
        />
        <StatCard
          label="Биологическая ценность"
          icon={Check}
          value={
            <>
              {nf(q.bc, 1)}
              <span className="text-base font-normal text-muted-foreground">
                {' '}
                %
              </span>
            </>
          }
          accent="good"
        />
        <StatCard
          label="Коэф. утилитарности U"
          value={nf(q.U, 2)}
          sub={`Избыточность G = ${nf(q.G, 2)} г/100 г белка`}
          accent="primary"
        />
      </div>

      {result.warnings != null && result.warnings.length > 0 && (
        <div className="border-warning/40 bg-warning/5 text-warning-foreground flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            {result.warnings.map((w: string, i: number) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {result.verdict && <VerdictCard verdict={result.verdict} />}

      {result.daily_norms && (
        <DailyNormsCard data={result.daily_norms} subject="рецептуры" />
      )}

      <RecipeCompositionCard vm={vm} />

      <AminoScoreCard vm={vm} />

      <QualityIndicatorsCard vm={vm} />

      <AminoDetailsCard vm={vm} />
    </div>
  )
}
