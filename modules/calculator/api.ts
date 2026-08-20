import { fetchApi } from '@/shared/api/client'
import type { SavedRecipeDetail } from '@/modules/saved/api'

export interface CalcItem { product_id: string; amount_g: number }
export interface CalcRequest { reference_protein_id: string; items: CalcItem[] }

export interface CandidateIn {
  product_id: string
  price_per_kg: number
  min_amount_g?: number
  max_amount_g?: number
}

export interface OptConstraints {
  bc_min?: number
  kras_max?: number
}

export interface OptimizeCostRequest {
  reference_protein_id: string
  candidates: CandidateIn[]
  constraints?: OptConstraints
}

export interface ReferenceProteinValue {
  amino_acid: string
  value: number
}

export interface ReferenceProtein {
  id: string
  name: string
  description?: string
  is_default?: boolean
  values: ReferenceProteinValue[]
}

export interface AminoAcidResult {
  name: string
  m_j: number
  score: number
  is_min: boolean
  is_limiting?: boolean
  utility?: number | null
}

export interface ComputeRecipeItem {
  name: string
  region?: string | null
  subcategory?: string | null
  amount_g: number
}

export interface ComputeVerdict {
  level: 'good' | 'moderate' | 'poor'
  headline: string
  points: string[]
}

export interface ComputeResult {
  macro: { protein: number; fat: number; carb: number; fiber: number; protein_fat_ratio: number }
  quality: { bc: number; kras: number; V: number; G: number }
  amino_acids: AminoAcidResult[]
  energy_kcal: number
  c_min: { name: string; score: number } | null
  limiting_count: number
  limiting: string[]
  warnings?: string[]
  verdict?: ComputeVerdict | null
  recipe: ComputeRecipeItem[]
  sum_g: number
  reference: { name: string }
}

export interface OptimizeResult {
  total_cost_per_100g: number
  optimal_items: CalcItem[]
  report: ComputeResult
}

export const calculatorApi = {
  referenceProteins: () => fetchApi<ReferenceProtein[]>('/calculator/reference-proteins'),
  recipes: () => fetchApi<SavedRecipeDetail[]>('/calculator/recipes'),
  compute: (body: CalcRequest) =>
    fetchApi<ComputeResult>('/calculator/compute', { method: 'POST', body: JSON.stringify(body) }),
  optimizeCost: (body: OptimizeCostRequest) =>
    fetchApi<OptimizeResult>('/calculator/optimize-cost', { method: 'POST', body: JSON.stringify(body) }),
}
