import { fetchApi } from '@/shared/api/client'

export interface CalcItem { product_id: string; amount_g: number }
export interface CalcRequest { reference_protein_id: string; items: CalcItem[] }

export const calculatorApi = {
  referenceProteins: () => fetchApi<any[]>('/calculator/reference-proteins'),
  recipes: () => fetchApi<any[]>('/calculator/recipes'),
  compute: (body: CalcRequest) =>
    fetchApi<any>('/calculator/compute', { method: 'POST', body: JSON.stringify(body) }),
}
