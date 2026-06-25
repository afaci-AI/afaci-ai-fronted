import { fetchApi } from '@/shared/api/client'

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

export const nutrientsApi = {
  list: () => fetchApi<any[]>('/nutrients'),
  get: (id: string) => fetchApi<any>(`/nutrients/${id}`),
  create: (data: { product_id: string; nutrient_name_id: string; unit_id: string; quantity: number }) =>
    fetchApi<any>('/nutrients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi<any>(`/nutrients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/nutrients/${id}`, { method: 'DELETE' }),
  byProduct: (id: string) => fetchApi<any[]>(`/nutrients/product/${id}`),
}

export const tableApi = {
  products: (limit = 1000) => fetchApi<any[]>(`/table/products?limit=${limit}`),
}
