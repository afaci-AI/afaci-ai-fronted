'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { savedApi } from '../api'
import type { SavedRecipe, SavedGroup } from '../api'
import { useAuth } from '@/features/auth'
import { ALL, NONE } from '../model/recipes-list'

export function useSavedRecipes() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [groups, setGroups] = useState<SavedGroup[]>([])
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>(ALL)

  const [renameTarget, setRenameTarget] = useState<SavedRecipe | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SavedRecipe | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace('/login?next=/saved-recipes')
  }, [authLoading, isAuthenticated, router])

  const load = useCallback(async () => {
    try {
      const [gs, rs] = await Promise.all([
        savedApi.groups(),
        savedApi.recipes(),
      ])
      setGroups(gs)
      setRecipes(rs)
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

  const groupName = useCallback(
    (id: string | null) => groups.find((g) => g.id === id)?.name ?? null,
    [groups],
  )

  const filtered = useMemo(() => {
    if (filter === ALL) return recipes
    if (filter === NONE) return recipes.filter((r) => !r.group_id)
    return recipes.filter((r) => r.group_id === filter)
  }, [recipes, filter])

  const ungroupedCount = recipes.filter((r) => !r.group_id).length

  const createGroup = async (name: string) => {
    await savedApi.createGroup({ name })
    await load()
  }

  const moveRecipe = async (recipe: SavedRecipe, groupId: string) => {
    try {
      await savedApi.updateRecipe(recipe.id, {
        group_id: groupId === NONE ? null : groupId,
      })
      toast.success('Рецептура перемещена')
      await load()
    } catch (e) {
      toast.error('Не удалось переместить', {
        description: e instanceof Error ? e.message : String(e),
      })
    }
  }

  const doRename = async () => {
    if (!renameTarget || !renameValue.trim()) return
    try {
      await savedApi.updateRecipe(renameTarget.id, { name: renameValue.trim() })
      toast.success('Переименовано')
      setRenameTarget(null)
      await load()
    } catch (e) {
      toast.error('Не удалось переименовать', {
        description: e instanceof Error ? e.message : String(e),
      })
    }
  }

  return {
    groups,
    setGroups,
    recipes,
    setRecipes,
    loading,
    setLoading,
    filter,
    setFilter,
    renameTarget,
    setRenameTarget,
    renameValue,
    setRenameValue,
    deleteTarget,
    setDeleteTarget,
    isAuthenticated,
    authLoading,
    router,
    load,
    groupName,
    filtered,
    ungroupedCount,
    createGroup,
    moveRecipe,
    doRename,
  }
}

export type UseSavedRecipesVm = ReturnType<typeof useSavedRecipes>
