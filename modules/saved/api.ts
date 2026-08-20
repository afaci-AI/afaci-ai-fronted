import { fetchApi } from '@/shared/api/client'

export interface SavedItem {
  product_id: string
  amount_g: number
  sort_order?: number
  price_per_kg?: number | null
}
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

export interface SavedGroup {
  id: string
  name: string
  recipe_count: number
}

export interface RecipeMetrics {
  bc?: number | null
  kras?: number | null
  V?: number | null
  G?: number | null
}

export interface SavedRecipe {
  id: string
  name: string
  group_id: string | null
  draft?: boolean
  metrics?: RecipeMetrics | null
}

export interface SavedRecipeDetail extends SavedRecipe {
  reference_protein_id: string
  items: SavedItem[]
}

export interface RankedRecipe {
  recipe_id: string
  rank: number
  name: string
  group?: string | null
  composite: number
  bc: number
  kras: number
  V: number
  G: number
}

export interface RankingResult {
  winner: string
  ranking: RankedRecipe[]
}

export const savedApi = {
  groups: () => fetchApi<SavedGroup[]>('/saved/groups'),
  createGroup: (data: { name: string }) =>
    fetchApi<SavedGroup>('/saved/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGroup: (id: string, data: { name: string }) =>
    fetchApi<SavedGroup>(`/saved/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteGroup: (id: string) =>
    fetchApi<void>(`/saved/groups/${id}`, { method: 'DELETE' }),

  recipes: (groupId?: string) =>
    fetchApi<SavedRecipe[]>(
      `/saved/recipes${groupId ? `?group_id=${groupId}` : ''}`,
    ),
  recipe: (id: string) => fetchApi<SavedRecipeDetail>(`/saved/recipes/${id}`),
  createRecipe: (body: SaveRecipeBody) =>
    fetchApi<SavedRecipeDetail>('/saved/recipes', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateRecipe: (id: string, body: UpdateRecipeBody) =>
    fetchApi<SavedRecipeDetail>(`/saved/recipes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteRecipe: (id: string) =>
    fetchApi<void>(`/saved/recipes/${id}`, { method: 'DELETE' }),

  ranking: (body: {
    recipe_ids: string[]
    weights?: { bc: number; kras: number; v: number; g: number }
  }) =>
    fetchApi<RankingResult>('/saved/ranking', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
