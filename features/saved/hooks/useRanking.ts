'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { savedApi } from '../api'
import type { SavedRecipe, SavedGroup, RankingResult } from '../api'
import { useAuth } from '@/features/auth'

export function useRanking() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [groups, setGroups] = useState<SavedGroup[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RankingResult | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login?next=/ranking')
  }, [authLoading, isAuthenticated, router])

  const load = useCallback(async () => {
    try {
      const [rs, gs] = await Promise.all([
        savedApi.recipes(),
        savedApi.groups(),
      ])
      setRecipes(rs)
      setGroups(gs)
    } catch (e) {
      toast.error('Не удалось загрузить рецептуры', {
        description: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    ;(async () => {
      await load()
    })()
  }, [isAuthenticated, load])

  const groupName = (id: string | null) =>
    groups.find((g) => g.id === id)?.name ?? null
  // В ранжировании участвуют только рассчитанные рецептуры (у черновиков нет показателей).
  const computable = recipes.filter((r) => r.metrics?.bc != null)
  const draftCount = recipes.length - computable.length
  const selectedIds = Object.keys(selected).filter((id) => selected[id])

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }))
  const toggleAll = () => {
    if (selectedIds.length === computable.length) setSelected({})
    else setSelected(Object.fromEntries(computable.map((r) => [r.id, true])))
  }

  const run = async () => {
    if (selectedIds.length < 2) {
      toast.error('Выберите минимум две рецептуры для сравнения')
      return
    }
    setRunning(true)
    try {
      const res = await savedApi.ranking({ recipe_ids: selectedIds })
      setResult(res)
      setTimeout(
        () =>
          document
            .getElementById('ranking-results')
            ?.scrollIntoView({ behavior: 'smooth' }),
        50,
      )
    } catch (e) {
      toast.error('Ранжирование не выполнено', {
        description: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setRunning(false)
    }
  }

  const winner = result?.ranking?.find((x) => x.recipe_id === result.winner)
  const chartData = (result?.ranking ?? []).map((x) => ({
    name: x.name.length > 14 ? x.name.slice(0, 13) + '…' : x.name,
    composite: Math.round(x.composite * 100),
    isWinner: x.recipe_id === result?.winner,
  }))

  return {
    winner,
    chartData,
    recipes,
    setRecipes,
    groups,
    setGroups,
    selected,
    setSelected,
    loading,
    setLoading,
    running,
    setRunning,
    result,
    setResult,
    isAuthenticated,
    authLoading,
    router,
    load,
    groupName,
    computable,
    draftCount,
    selectedIds,
    toggle,
    toggleAll,
    run,
  }
}

export type UseRankingVm = ReturnType<typeof useRanking>
