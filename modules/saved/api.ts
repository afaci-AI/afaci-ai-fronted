import { fetchApi } from '@/shared/api/client'

export interface SavedItem { product_id: string; amount_g: number; sort_order?: number; price_per_kg?: number | null }
export interface SaveRecipeBody {
  name: string
  group_id?: string | null
  new_group_name?: string | null
  reference_protein_id: string
  items: SavedItem[]
  draft?: boolean
}
export interface UpdateRecipeBody {
  name?: string
  group_id?: string | null
  reference_protein_id?: string
  items?: SavedItem[]
  draft?: boolean
}

export const savedApi = {
  groups: () => fetchApi<any[]>('/saved/groups'),
  createGroup: (data: { name: string }) =>
    fetchApi<any>('/saved/groups', { method: 'POST', body: JSON.stringify(data) }),
  updateGroup: (id: string, data: { name: string }) =>
    fetchApi<any>(`/saved/groups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteGroup: (id: string) =>
    fetchApi<any>(`/saved/groups/${id}`, { method: 'DELETE' }),

  recipes: (groupId?: string) =>
    fetchApi<any[]>(`/saved/recipes${groupId ? `?group_id=${groupId}` : ''}`),
  recipe: (id: string) => fetchApi<any>(`/saved/recipes/${id}`),
  createRecipe: (body: SaveRecipeBody) =>
    fetchApi<any>('/saved/recipes', { method: 'POST', body: JSON.stringify(body) }),
  updateRecipe: (id: string, body: UpdateRecipeBody) =>
    fetchApi<any>(`/saved/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteRecipe: (id: string) =>
    fetchApi<any>(`/saved/recipes/${id}`, { method: 'DELETE' }),

  ranking: (body: { recipe_ids: string[]; weights?: { bc: number; kras: number; v: number; g: number } }) =>
    fetchApi<any>('/saved/ranking', { method: 'POST', body: JSON.stringify(body) }),
}
