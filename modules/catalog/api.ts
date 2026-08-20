import { fetchApi } from '@/shared/api/client'
import type {
  Category,
  Subcategory,
  Region,
  Unit,
  NutrientType,
  NutrientName,
} from '@/lib/types'

export const categoriesApi = {
  list: () => fetchApi<Category[]>('/categories'),
  get: (id: string) => fetchApi<Category>(`/categories/${id}`),
  create: (data: { name: string }) => fetchApi<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/categories/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<Category[]>('/categories/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

export const subcategoriesApi = {
  list: () => fetchApi<Subcategory[]>('/subcategories'),
  get: (id: string) => fetchApi<Subcategory>(`/subcategories/${id}`),
  create: (data: { name: string; category_id: string }) => fetchApi<Subcategory>('/subcategories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<Subcategory>(`/subcategories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/subcategories/${id}`, { method: 'DELETE' }),
}

export const regionsApi = {
  list: () => fetchApi<Region[]>('/regions'),
  get: (id: string) => fetchApi<Region>(`/regions/${id}`),
  create: (data: { name: string }) => fetchApi<Region>('/regions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<Region>(`/regions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/regions/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<Region[]>('/regions/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

export const unitsApi = {
  list: () => fetchApi<Unit[]>('/units'),
  get: (id: string) => fetchApi<Unit>(`/units/${id}`),
  create: (data: { name: string }) => fetchApi<Unit>('/units', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<Unit>(`/units/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/units/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<Unit[]>('/units/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

export const nutrientTypesApi = {
  list: () => fetchApi<NutrientType[]>('/nutrient-types'),
  get: (id: string) => fetchApi<NutrientType>(`/nutrient-types/${id}`),
  create: (data: { name: string }) => fetchApi<NutrientType>('/nutrient-types', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<NutrientType>(`/nutrient-types/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/nutrient-types/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<NutrientType[]>('/nutrient-types/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

export const nutrientNamesApi = {
  list: () => fetchApi<NutrientName[]>('/nutrient-names'),
  get: (id: string) => fetchApi<NutrientName>(`/nutrient-names/${id}`),
  create: (data: { name: string }) => fetchApi<NutrientName>('/nutrient-names', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<NutrientName>(`/nutrient-names/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/nutrient-names/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<NutrientName[]>('/nutrient-names/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}
