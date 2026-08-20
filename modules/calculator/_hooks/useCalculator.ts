'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { calculatorApi, type OptConstraints, type ReferenceProtein, type ComputeResult } from '../api'
import { savedApi, type SavedRecipeDetail } from '@/modules/saved/api'
import { tableApi, type CalcProduct } from '@/modules/products/api'

export interface Row { key: number; product_id: string; amount: string; price: string }

const REQUIRED_SUM = 100
let rowSeq = 1

export function useCalculator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [references, setReferences] = useState<ReferenceProtein[]>([])
  const [refId, setRefId] = useState<string>('')
  const [products, setProducts] = useState<CalcProduct[]>([])
  const [recipes, setRecipes] = useState<SavedRecipeDetail[]>([])
  const [rows, setRows] = useState<Row[]>([{ key: rowSeq++, product_id: '', amount: '', price: '' }])
  const [costEnabled, setCostEnabled] = useState(false)
  const [result, setResult] = useState<ComputeResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [editing, setEditing] = useState<{ id: string; name: string; group_id: string | null } | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?next=/calculator')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    ;(async () => {
      try {
        const [refs, prods, recs] = await Promise.all([
          calculatorApi.referenceProteins(),
          tableApi.products(),
          calculatorApi.recipes(),
        ])
        setReferences(refs)
        setProducts(prods)
        setRecipes(recs)
        const def = refs.find((r) => r.is_default) ?? refs[0]

        const params = new URLSearchParams(window.location.search)
        const editId = params.get('edit')
        const loadId = params.get('load')
        const targetId = editId || loadId
        if (targetId) {
          try {
            const rec = await savedApi.recipe(targetId)
            const hasPrice = rec.items.some((it) => it.price_per_kg != null)
            if (hasPrice) setCostEnabled(true)
            setRows(rec.items.map((it) => ({
              key: rowSeq++, product_id: it.product_id, amount: String(it.amount_g),
              price: it.price_per_kg != null ? String(it.price_per_kg) : '',
            })))
            setRefId(rec.reference_protein_id || def?.id || '')
            if (editId) setEditing({ id: rec.id, name: rec.name, group_id: rec.group_id })
            else toast.success(`Загружена рецептура: ${rec.name}`)
          } catch {
            if (def) setRefId(def.id)
          }
        } else if (def) {
          setRefId(def.id)
        }
      } catch (e) {
        toast.error('Не удалось загрузить данные', { description: e instanceof Error ? e.message : String(e) })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const selectedRef = references.find((r) => r.id === refId)
  const sum = useMemo(
    () => rows.reduce((s, r) => s + (parseFloat(r.amount.replace(',', '.')) || 0), 0),
    [rows],
  )
  const allSelected = rows.length > 0 && rows.every((r) => r.product_id && r.amount !== '')
  const sumValid = Math.abs(sum - REQUIRED_SUM) < 0.01
  const canCompute = allSelected && sumValid && !!refId
  const canOptimize =
    costEnabled &&
    rows.length > 0 &&
    rows.every((r) => r.product_id && r.price !== '') &&
    !!refId
  const usedIds = rows.map((r) => r.product_id).filter(Boolean)

  const addRow = () => setRows((rs) => [...rs, { key: rowSeq++, product_id: '', amount: '', price: '' }])
  const removeRow = (key: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs))
  const patchRow = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const totalCost = useMemo(() => {
    if (!costEnabled) return null
    const allPriced = rows.every((r) => r.price !== '')
    if (!allPriced) return null
    return rows.reduce((s, r) => {
      const amt = parseFloat(r.amount.replace(',', '.')) || 0
      const price = parseFloat(r.price.replace(',', '.')) || 0
      return s + amt * price
    }, 0)
  }, [costEnabled, rows])

  const loadExample = () => {
    const rec = recipes[0]
    if (!rec) return
    setRows(rec.items.map((it) => ({
      key: rowSeq++, product_id: it.product_id, amount: String(it.amount_g), price: '',
    })))
    const def = references.find((r) => r.is_default) ?? references[0]
    if (def) setRefId(def.id)
    setResult(null)
    toast.success(`Загружена рецептура: ${rec.name}`)
  }

  const reset = () => {
    setRows([{ key: rowSeq++, product_id: '', amount: '', price: '' }])
    setResult(null)
  }

  const compute = async () => {
    setComputing(true)
    try {
      const res = await calculatorApi.compute({
        reference_protein_id: refId,
        items: rows.map((r) => ({
          product_id: r.product_id,
          amount_g: parseFloat(r.amount.replace(',', '.')) || 0,
        })),
      })
      setResult(res)
      setTimeout(() => document.getElementById('calc-results')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (e) {
      toast.error('Расчёт не выполнен', { description: e instanceof Error ? e.message : String(e) })
    } finally {
      setComputing(false)
    }
  }

  const optimizeCost = async (
    constraints: OptConstraints,
    bounds: { key: number; min: string; max: string }[],
  ) => {
    setOptimizing(true)
    try {
      const boundMap = new Map(bounds.map((b) => [b.key, b]))
      const candidates = rows
        .filter((r) => r.product_id && r.price !== '')
        .map((r) => ({
          product_id: r.product_id,
          price_per_kg: parseFloat(r.price.replace(',', '.')) || 0,
          min_amount_g: parseFloat(boundMap.get(r.key)?.min || '0') || 0,
          max_amount_g: parseFloat(boundMap.get(r.key)?.max || '100') || 100,
        }))

      const res = await calculatorApi.optimizeCost({
        reference_protein_id: refId,
        candidates,
        constraints,
      })

      const amountMap = new Map<string, number>(
        res.optimal_items.map((it) => [it.product_id, it.amount_g]),
      )
      setRows((rs) =>
        rs.map((r) =>
          amountMap.has(r.product_id)
            ? { ...r, amount: String(amountMap.get(r.product_id)!.toFixed(4)) }
            : r,
        ),
      )
      setResult(res.report)
      setTimeout(
        () => document.getElementById('calc-results')?.scrollIntoView({ behavior: 'smooth' }),
        50,
      )
      toast.success(`Оптимальная стоимость: ${res.total_cost_per_100g.toFixed(2)} сом / 100 г`)
    } catch (e) {
      toast.error('Оптимизация не выполнена', { description: e instanceof Error ? e.message : String(e) })
    } finally {
      setOptimizing(false)
    }
  }

  return {
    authLoading,
    isAuthenticated,
    references,
    refId,
    setRefId,
    products,
    recipes,
    rows,
    result,
    loading,
    computing,
    optimizing,
    editing,
    selectedRef,
    sum,
    sumValid,
    canCompute,
    canOptimize,
    usedIds,
    REQUIRED_SUM,
    costEnabled,
    setCostEnabled,
    totalCost,
    addRow,
    removeRow,
    patchRow,
    loadExample,
    reset,
    compute,
    optimizeCost,
  }
}
