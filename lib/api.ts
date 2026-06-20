async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }
  
  return res.json()
}

// Categories
export const categoriesApi = {
  list: () => fetchApi<any[]>('/categories'),
  get: (id: string) => fetchApi<any>(`/categories/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/categories/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/categories/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

// Subcategories
export const subcategoriesApi = {
  list: () => fetchApi<any[]>('/subcategories'),
  get: (id: string) => fetchApi<any>(`/subcategories/${id}`),
  create: (data: { name: string; category_id: string }) => fetchApi<any>('/subcategories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/subcategories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/subcategories/${id}`, { method: 'DELETE' }),
}

// Regions
export const regionsApi = {
  list: () => fetchApi<any[]>('/regions'),
  get: (id: string) => fetchApi<any>(`/regions/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/regions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/regions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/regions/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/regions/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

// Units
export const unitsApi = {
  list: () => fetchApi<any[]>('/units'),
  get: (id: string) => fetchApi<any>(`/units/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/units', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/units/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/units/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/units/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

// Nutrient Types
export const nutrientTypesApi = {
  list: () => fetchApi<any[]>('/nutrient-types'),
  get: (id: string) => fetchApi<any>(`/nutrient-types/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/nutrient-types', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/nutrient-types/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/nutrient-types/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/nutrient-types/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

// Nutrient Names
export const nutrientNamesApi = {
  list: () => fetchApi<any[]>('/nutrient-names'),
  get: (id: string) => fetchApi<any>(`/nutrient-names/${id}`),
  create: (data: { name: string }) => fetchApi<any>('/nutrient-names', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string }) => fetchApi<any>(`/nutrient-names/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/nutrient-names/${id}`, { method: 'DELETE' }),
  bulk: (names: string[]) => fetchApi<any>('/nutrient-names/bulk', { method: 'POST', body: JSON.stringify({ names }) }),
}

// Products
export const productsApi = {
  list: () => fetchApi<any[]>('/products'),
  get: (id: string) => fetchApi<any>(`/products/${id}`),
  create: (data: { name: string; category_id: string; subcategory_id?: string; region_id: string }) => 
    fetchApi<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi<any>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/products/${id}`, { method: 'DELETE' }),
  byRegion: (id: string) => fetchApi<any[]>(`/products/by-region/${id}`),
  byCategory: (id: string) => fetchApi<any[]>(`/products/by-category/${id}`),
  auto: (data: { name: string; category_name: string; subcategory_name?: string; region_name: string }) => 
    fetchApi<any>('/products/auto', { method: 'POST', body: JSON.stringify(data) }),
}

// Nutrients
export const nutrientsApi = {
  list: () => fetchApi<any[]>('/nutrients'),
  get: (id: string) => fetchApi<any>(`/nutrients/${id}`),
  create: (data: { product_id: string; nutrient_name_id: string; unit_id: string; quantity: number }) =>
    fetchApi<any>('/nutrients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi<any>(`/nutrients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/nutrients/${id}`, { method: 'DELETE' }),
  byProduct: (id: string) => fetchApi<any[]>(`/nutrients/product/${id}`),
}
// Flat table (FK dereferenced) — удобно для селекторов
export const tableApi = {
  products: (limit = 1000) => fetchApi<any[]>(`/table/products?limit=${limit}`),
}

// Калькулятор пищевой и биологической ценности
export interface CalcItem { product_id: string; amount_g: number }
export interface CalcRequest { reference_protein_id: string; items: CalcItem[] }

export const calculatorApi = {
  referenceProteins: () => fetchApi<any[]>('/calculator/reference-proteins'),
  recipes: () => fetchApi<any[]>('/calculator/recipes'),
  compute: (body: CalcRequest) =>
    fetchApi<any>('/calculator/compute', { method: 'POST', body: JSON.stringify(body) }),
}
