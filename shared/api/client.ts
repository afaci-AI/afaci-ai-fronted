export const TOKEN_KEY = 'afaci_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    // 401 на аутентифицированном запросе = сессия недействительна (в т.ч. истёк срок доступа) — принудительный логаут.
    if (res.status === 401 && token && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('afaci:session-expired', { detail: error.detail }))
    }
    throw new Error(error.detail || `HTTP ${res.status}`)
  }

  return res.json()
}
