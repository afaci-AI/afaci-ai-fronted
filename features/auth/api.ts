import { fetchApi } from '@/shared/api/client'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string | null
}
export interface AuthResponse {
  access_token: string
  user: AuthUser
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => fetchApi<AuthUser>('/auth/me'),
  requestPasswordReset: (email: string) =>
    fetchApi<{ status: string; message: string; resend_after?: number }>(
      '/auth/password-reset/request',
      { method: 'POST', body: JSON.stringify({ email }) },
    ),
  verifyPasswordReset: (data: { email: string; code: string }) =>
    fetchApi<{ status: string }>('/auth/password-reset/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  confirmPasswordReset: (data: {
    email: string
    code: string
    new_password: string
  }) =>
    fetchApi<{ status: string }>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
