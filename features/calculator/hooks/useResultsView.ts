'use client'

import { COL } from '../model/utils'
import type { ComputeResult } from '../api'

export function useResultsView(result: ComputeResult) {
  const m = result.macro
  const q = result.quality
  const macroData = [
    { name: 'Белок', value: m.protein, color: COL.protein },
    { name: 'Жир', value: m.fat, color: COL.fat },
    { name: 'Углеводы', value: m.carb, color: COL.carb },
    { name: 'Пищ. волокна', value: m.fiber, color: COL.fiber },
  ]
  const sortedAmino = [...result.amino_acids].sort((a, b) => a.score - b.score)
  const scoreData = sortedAmino.map((a) => ({
    name: a.name,
    score: a.score,
    m_j: a.m_j,
    is_min: a.is_min,
    color: a.is_min ? COL.min : a.score >= 100 ? COL.good : COL.score,
  }))
  const utilData = sortedAmino
    .filter((a) => a.utility != null)
    .map((a) => ({
      name: a.name,
      utility: a.utility,
      is_min: a.is_min,
      color: a.is_min ? COL.min : COL.score,
    }))
  const bcData = [{ name: 'белок', bc: q.bc, kras: q.kras }]

  return { m, q, macroData, sortedAmino, scoreData, utilData, bcData, result }
}

export type UseResultsViewVm = ReturnType<typeof useResultsView>
