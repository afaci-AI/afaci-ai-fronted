'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from './types'
import { authApi, getToken, setToken, type AuthUser } from './api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, name: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)
const USER_KEY = 'afaci_user'

function toUser(u: AuthUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: (u.role as UserRole) ?? 'viewer',
    isActive: u.isActive,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt ?? undefined,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Восстановление сессии при загрузке: токен + кэш пользователя, затем проверка /me.
  useEffect(() => {
    let cancelled = false
    const token = getToken()

    ;(async () => {
      if (token) {
        const cached = typeof window !== 'undefined' ? window.localStorage.getItem(USER_KEY) : null
        if (cached) {
          try {
            const cachedUser = JSON.parse(cached) as User
            if (!cancelled) setUser(cachedUser)
          } catch {
            // ignore malformed cache
          }
        }
        try {
          const u = await authApi.me()
          const mapped = toUser(u)
          if (!cancelled) {
            setUser(mapped)
            window.localStorage.setItem(USER_KEY, JSON.stringify(mapped))
          }
        } catch {
          // токен недействителен — выходим
          if (!cancelled) {
            setToken(null)
            window.localStorage.removeItem(USER_KEY)
            setUser(null)
          }
        }
      }
      if (!cancelled) setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback((token: string, u: AuthUser) => {
    setToken(token)
    const mapped = toUser(u)
    setUser(mapped)
    window.localStorage.setItem(USER_KEY, JSON.stringify(mapped))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const res = await authApi.login({ email, password })
    persist(res.access_token, res.user)
    return true
  }, [persist])

  const register = useCallback(async (email: string, name: string, password: string): Promise<boolean> => {
    const res = await authApi.register({ email, name, password })
    persist(res.access_token, res.user)
    return true
  }, [persist])

  const logout = useCallback(() => {
    setToken(null)
    if (typeof window !== 'undefined') window.localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  // Сервер вернул 401 на аутентифицированном запросе (истёк срок доступа/токен) — разлогиниваем на фронте.
  useEffect(() => {
    function handleSessionExpired() {
      logout()
    }
    window.addEventListener('afaci:session-expired', handleSessionExpired)
    return () => window.removeEventListener('afaci:session-expired', handleSessionExpired)
  }, [logout])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
