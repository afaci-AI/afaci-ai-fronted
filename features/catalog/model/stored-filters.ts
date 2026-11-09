export const ALL = 'all'
export const FILTERS_KEY = 'database-filters'

export const readStoredFilters = (): {
  query: string
  category: string
  subcategory: string
  region: string
} | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(FILTERS_KEY)
    if (!raw) return null
    const f = JSON.parse(raw)
    return {
      query: f.query ?? '',
      category: f.category ?? ALL,
      subcategory: f.subcategory ?? ALL,
      region: f.region ?? ALL,
    }
  } catch {
    // ignore malformed storage
    return null
  }
}
