'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, UserRole } from './types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Demo users for testing different roles
const demoUsers: Record<string, User> = {
  'admin@example.com': {
    id: '1',
    email: 'admin@example.com',
    name: 'Администратор',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-03-20T14:30:00Z',
  },
  'editor@example.com': {
    id: '2',
    email: 'editor@example.com',
    name: 'Редактор Иванов',
    role: 'editor',
    isActive: true,
    createdAt: '2024-02-01T09:00:00Z',
    lastLoginAt: '2024-03-19T11:20:00Z',
  },
  'viewer@example.com': {
    id: '3',
    email: 'viewer@example.com',
    name: 'Аналитик Петров',
    role: 'viewer',
    isActive: true,
    createdAt: '2024-02-15T08:00:00Z',
    lastLoginAt: '2024-03-18T09:45:00Z',
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const demoUser = demoUsers[email.toLowerCase()]
    if (demoUser) {
      setUser(demoUser)
      return true
    }
    
    // For demo, accept any email with password "demo"
    if (_password === 'demo') {
      setUser({
        id: '999',
        email,
        name: email.split('@')[0],
        role: 'viewer',
        isActive: true,
        createdAt: new Date().toISOString(),
      })
      return true
    }
    
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    if (user) {
      setUser({ ...user, role })
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
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
