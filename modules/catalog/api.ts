import { fetchApi } from '@/shared/api/client'

export const categoriesApi = {
  list: () => fetchApi<any[]>('/categories'),
  get: (id: string) => fetchApi<any>(`/categories/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/categories/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/categories/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

export const subcategoriesApi = {
  list: () => fetchApi<any[]>('/subcategories'),
  get: (id: string) => fetchApi<any>(`/subcategories/${id}`),
  create: (data: { name: string; category_id: string }) => fetchApi<any>('/subcategories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/subcategories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/subcategories/${id}`, { method: 'DELETE' }),
}

export const regionsApi = {
  list: () => fetchApi<any[]>('/regions'),
  get: (id: string) => fetchApi<any>(`/regions/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/regions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/regions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/regions/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/regions/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

export const unitsApi = {
  list: () => fetchApi<any[]>('/units'),
  get: (id: string) => fetchApi<any>(`/units/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/units', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/units/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/units/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/units/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

export const nutrientTypesApi = {
  list: () => fetchApi<any[]>('/nutrient-types'),
  get: (id: string) => fetchApi<any>(`/nutrient-types/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/nutrient-types', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/nutrient-types/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/nutrient-types/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/nutrient-types/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

export const nutrientNamesApi = {
  list: () => fetchApi<any[]>('/nutrient-names'),
  get: (id: string) => fetchApi<any>(`/nutrient-names/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/nutrient-names', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/nutrient-names/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/nutrient-names/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/nutrient-names/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}
