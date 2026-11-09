import type { UserRole, UserStatus } from '@/shared/api/types'

export const roleLabels: Record<UserRole, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Аналитик',
}

export const roleBadgeVariants: Record<
  UserRole,
  'default' | 'secondary' | 'outline'
> = {
  admin: 'default',
  editor: 'secondary',
  viewer: 'outline',
}

export const statusLabels: Record<UserStatus, string> = {
  active: 'Активен',
  unlimited: 'Безлимитный',
  blocked: 'Заблокирован',
  expired: 'Истёк',
}

export const statusBadgeVariants: Record<
  UserStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'outline',
  unlimited: 'outline',
  blocked: 'secondary',
  expired: 'destructive',
}

export const EXPIRY_SOON_DAYS = 3

export function isExpiringSoon(accessExpiresAt: string | null): boolean {
  if (!accessExpiresAt) return false
  const diffMs = new Date(accessExpiresAt).getTime() - Date.now()
  return diffMs > 0 && diffMs <= EXPIRY_SOON_DAYS * 24 * 60 * 60 * 1000
}

// datetime-local не понимает временную зону — приводим к локальному "YYYY-MM-DDTHH:mm".
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export interface UserFormData {
  name: string
  email: string
  password: string
  role: UserRole
  unlimited: boolean
  accessExpiresAt: string
}

export const emptyForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'viewer',
  unlimited: true,
  accessExpiresAt: '',
}
