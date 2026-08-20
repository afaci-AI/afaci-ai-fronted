import { fetchApi } from '@/shared/api/client'
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  Nutrient,
  NutrientCreate,
  NutrientUpdate,
  ProductWithRelations,
  NutrientWithRelations,
} from '@/lib/types'

export const productsApi = {
  list: () => fetchApi<Product[]>('/products'),
  get: (id: string) => fetchApi<Product>(`/products/${id}`),
  create: (data: ProductCreate) =>
    fetchApi<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: ProductUpdate) => fetchApi<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/products/${id}`, { method: 'DELETE' }),
  byRegion: (id: string) => fetchApi<Product[]>(`/products/by-region/${id}`),
  byCategory: (id: string) => fetchApi<Product[]>(`/products/by-category/${id}`),
  auto: (data: { name: string; category_name: string; subcategory_name?: string; region_name: string }) =>
    fetchApi<ProductWithRelations>('/products/auto', { method: 'POST', body: JSON.stringify(data) }),
}

export const nutrientsApi = {
  list: () => fetchApi<Nutrient[]>('/nutrients'),
  get: (id: string) => fetchApi<Nutrient>(`/nutrients/${id}`),
  create: (data: NutrientCreate) =>
    fetchApi<Nutrient>('/nutrients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: NutrientUpdate) => fetchApi<Nutrient>(`/nutrients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/nutrients/${id}`, { method: 'DELETE' }),
  byProduct: (id: string) => fetchApi<NutrientWithRelations[]>(`/nutrients/product/${id}`),
}

export interface CalcProduct {
  product_id: string
  product_name: string
  subcategory_name: string
  region_name: string
}

export const tableApi = {
  products: (limit = 1000) => fetchApi<CalcProduct[]>(`/table/products?limit=${limit}`),
}
