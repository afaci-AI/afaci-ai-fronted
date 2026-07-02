import { fetchApi } from '@/shared/api/client'

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

export const calculatorApi = {
  referenceProteins: () => fetchApi<any[]>('/calculator/reference-proteins'),
  recipes: () => fetchApi<any[]>('/calculator/recipes'),
  compute: (body: CalcRequest) =>
    fetchApi<any>('/calculator/compute', { method: 'POST', body: JSON.stringify(body) }),
  optimizeCost: (body: OptimizeCostRequest) =>
    fetchApi<any>('/calculator/optimize-cost', { method: 'POST', body: JSON.stringify(body) }),
}
