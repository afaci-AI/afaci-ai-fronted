import { fetchApi } from '@/shared/api/client'

export interface AuthUser {
  id: string; email: string; name: string; role: string
  isActive: boolean; createdAt: string; lastLoginAt?: string | null
}
export interface AuthResponse { access_token: string; user: AuthUser }

export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    fetchApi<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    fetchApi<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => fetchApi<AuthUser>('/auth/me'),
}
