import { fetchApi } from '@/shared/api/client'
import type { UserRole, UserStatus } from '@/shared/api/types'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  accessExpiresAt: string | null
  mustChangePassword: boolean
  temporaryPasswordExpiresAt?: string | null
  status: UserStatus
  createdAt: string
  lastLoginAt: string | null
}

/** Результат отправки письма с данными для входа — отдельно от создания. */
export interface CredentialsEmail {
  sent: boolean
  error: string | null
}

export type AdminUserWithEmail = AdminUser & {
  credentialsEmail: CredentialsEmail
}

/** Пароль задаёт сервер: временный пароль уходит пользователю письмом. */
export interface UserCreateData {
  email: string
  name: string
  role: UserRole
  access_expires_at?: string | null
}

export interface UserUpdateData {
  name?: string
  role?: UserRole
  is_active?: boolean
  access_expires_at?: string | null
  access_expires_at_unlimited?: boolean
}

export const usersApi = {
  list: (params?: { search?: string; role?: string }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.role) q.set('role', params.role)
    const qs = q.toString()
    return fetchApi<AdminUser[]>(`/users${qs ? `?${qs}` : ''}`)
  },
  get: (id: string) => fetchApi<AdminUser>(`/users/${id}`),
  create: (data: UserCreateData) =>
    fetchApi<AdminUserWithEmail>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UserUpdateData) =>
    fetchApi<AdminUser>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  resendCredentials: (id: string) =>
    fetchApi<AdminUserWithEmail>(`/users/${id}/resend-credentials`, {
      method: 'POST',
    }),
  deactivate: (id: string) =>
    fetchApi<{ status: string }>(`/users/${id}`, { method: 'DELETE' }),
}
