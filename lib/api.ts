// Реэкспорт для обратной совместимости — не добавлять сюда новый код.
// Новый код пишется в modules/<name>/api.ts и импортируется напрямую из модуля.

export { getToken, setToken, TOKEN_KEY } from '@/shared/api/client'

export {
  categoriesApi,
  subcategoriesApi,
  regionsApi,
  unitsApi,
  nutrientTypesApi,
  nutrientNamesApi,
} from '@/modules/catalog'
export { productsApi, nutrientsApi, tableApi } from '@/modules/products'
export { calculatorApi } from '@/modules/calculator'
export type { CalcItem, CalcRequest } from '@/modules/calculator'
export { authApi } from '@/modules/auth'
export type { AuthUser, AuthResponse } from '@/modules/auth'
export { savedApi } from '@/modules/saved'
export type {
  SavedItem,
  SaveRecipeBody,
  UpdateRecipeBody,
} from '@/modules/saved'
