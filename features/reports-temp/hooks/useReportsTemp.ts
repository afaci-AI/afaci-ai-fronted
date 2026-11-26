'use client'

// TEMP: reports-temp
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth'
import {
  reportsTempApi,
  type LookupProduct,
  type ReportOptions,
  type SavedRecipeOption,
} from '../api'
import {
  buildRequest,
  emptyForm,
  validate,
  type ReportForm,
  type ReportKind,
} from '../model/report-form'

const LOOKUP_DELAY_MS = 300

export function useReportsTemp() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [kind, setKind] = useState<ReportKind>('list')
  const [form, setForm] = useState<ReportForm>(emptyForm)
  const [options, setOptions] = useState<ReportOptions | null>(null)
  const [candidates, setCandidates] = useState<LookupProduct[]>([])
  const [picked, setPicked] = useState<LookupProduct | null>(null)
  const [recipes, setRecipes] = useState<SavedRecipeOption[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    reportsTempApi
      .options()
      .then(setOptions)
      .catch((e: Error) => toast.error(e.message))
    reportsTempApi
      .recipes()
      .then(setRecipes)
      .catch(() => setRecipes([]))
  }, [isAuthenticated])

  const search = form.name.trim()
  useEffect(() => {
    if (kind !== 'card' || !search || picked) {
      return
    }
    const timer = setTimeout(() => {
      reportsTempApi
        .lookup(search)
        .then(setCandidates)
        .catch(() => setCandidates([]))
    }, LOOKUP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [kind, search, picked])

  const update = useCallback((patch: Partial<ReportForm>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }, [])

  // Подкатегории выбранной категории (без дублей названий); без категории — все.
  const subcategoryNames = Array.from(
    new Set(
      (options?.subcategories ?? [])
        .filter((s) => !form.category || s.category === form.category)
        .map((s) => s.name),
    ),
  )

  const changeCategory = (category: string) => {
    // Выбранная подкатегория чужой категории сбрасывается.
    const stillValid = (options?.subcategories ?? []).some(
      (s) =>
        s.name === form.subcategory && (!category || s.category === category),
    )
    update({ category, subcategory: stillValid ? form.subcategory : '' })
  }

  const changeName = (name: string) => {
    // Новое слово поиска сбрасывает ранее выбранный продукт.
    setPicked(null)
    update({ name, productId: '' })
    if (!name.trim()) setCandidates([])
  }

  const pickProduct = (product: LookupProduct) => {
    setPicked(product)
    setCandidates([])
    update({ productId: product.id, name: product.name })
  }

  const error = validate(kind, form)

  const run = async (mode: 'download' | 'open') => {
    if (error) {
      toast.error(error)
      return
    }
    // Вкладку открываем сразу по клику: иначе браузер блокирует всплывающее окно.
    const tab = mode === 'open' ? window.open('', '_blank') : null
    setBusy(true)
    try {
      const { path, params } = buildRequest(kind, form)
      const blob = await reportsTempApi.pdf(path, params)
      const url = URL.createObjectURL(blob)
      if (tab) {
        tab.location.href = url
      } else {
        const link = document.createElement('a')
        link.href = url
        link.download = `${kind}-report.pdf`
        link.click()
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (e) {
      tab?.close()
      toast.error(e instanceof Error ? e.message : 'Не удалось построить отчёт')
    } finally {
      setBusy(false)
    }
  }

  return {
    isAuthenticated,
    authLoading,
    kind,
    setKind,
    form,
    update,
    options,
    recipes,
    candidates,
    picked,
    subcategoryNames,
    changeCategory,
    changeName,
    pickProduct,
    error,
    busy,
    run,
  }
}

export type UseReportsTempVm = ReturnType<typeof useReportsTemp>
