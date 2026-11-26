// TEMP: reports-temp — временная фича, подлежит удалению (см. REMOVE.md).
import { fetchApi, getToken } from '@/shared/api/client'

export interface NutrientOption {
  type: string
  name: string
  unit: string
}

export interface SubcategoryOption {
  name: string
  category: string
}

export interface ReportOptions {
  categories: string[]
  subcategories: SubcategoryOption[]
  regions: string[]
  nutrients: NutrientOption[]
}

export interface LookupProduct {
  id: string
  name: string
  category: string
  region: string
}

export interface SavedRecipeOption {
  id: string
  name: string
}

export type PdfParams = Record<string, string | number | boolean | undefined>

export const reportsTempApi = {
  options: () => fetchApi<ReportOptions>('/reports-temp/options'),

  lookup: (name: string) =>
    fetchApi<LookupProduct[]>(
      `/reports-temp/products/lookup?name=${encodeURIComponent(name)}`,
    ),

  recipes: () => fetchApi<SavedRecipeOption[]>('/reports-temp/recipes'),

  // PDF приходит бинарным, поэтому fetchApi (он читает JSON) здесь не подходит.
  async pdf(path: string, params: PdfParams): Promise<Blob> {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') query.set(key, String(value))
    }
    const token = getToken()
    const qs = query.toString()
    const res = await fetch(
      `/api/v1/reports-temp${path}${qs ? `?${qs}` : ''}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    )
    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ detail: 'Не удалось построить отчёт' }))
      throw new Error(
        typeof error.detail === 'string' ? error.detail : `HTTP ${res.status}`,
      )
    }
    return res.blob()
  },
}
