'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { calculatorApi } from '../api'
import { savedApi } from '@/modules/saved/api'
import { tableApi } from '@/modules/products/api'

export interface Row { key: number; product_id: string; amount: string }

const REQUIRED_SUM = 100
let rowSeq = 1

export function useCalculator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [references, setReferences] = useState<any[]>([])
  const [refId, setRefId] = useState<string>('')
  const [products, setProducts] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [rows, setRows] = useState<Row[]>([{ key: rowSeq++, product_id: '', amount: '' }])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)
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
        const def = refs.find((r: any) => r.is_default) ?? refs[0]

        const params = new URLSearchParams(window.location.search)
        const editId = params.get('edit')
        const loadId = params.get('load')
        const targetId = editId || loadId
        if (targetId) {
          try {
            const rec = await savedApi.recipe(targetId)
            setRows(rec.items.map((it: any) => ({
              key: rowSeq++, product_id: it.product_id, amount: String(it.amount_g),
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
      } catch (e: any) {
        toast.error('Не удалось загрузить данные', { description: e.message })
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
  const usedIds = rows.map((r) => r.product_id).filter(Boolean)

  const addRow = () => setRows((rs) => [...rs, { key: rowSeq++, product_id: '', amount: '' }])
  const removeRow = (key: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs))
  const patchRow = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const loadExample = () => {
    const rec = recipes[0]
    if (!rec) return
    setRows(rec.items.map((it: any) => ({
      key: rowSeq++, product_id: it.product_id, amount: String(it.amount_g),
    })))
    const def = references.find((r) => r.is_default) ?? references[0]
    if (def) setRefId(def.id)
    setResult(null)
    toast.success(`Загружена рецептура: ${rec.name}`)
  }

  const reset = () => {
    setRows([{ key: rowSeq++, product_id: '', amount: '' }])
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
    } catch (e: any) {
      toast.error('Расчёт не выполнен', { description: e.message })
    } finally {
      setComputing(false)
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
    editing,
    selectedRef,
    sum,
    sumValid,
    canCompute,
    usedIds,
    REQUIRED_SUM,
    addRow,
    removeRow,
    patchRow,
    loadExample,
    reset,
    compute,
  }
}
