'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from './auth-context'

export const CHANGE_PASSWORD_PATH = '/change-password'

/**
 * Пока временный пароль не сменён, пользователь видит только экран смены
 * пароля. Сервер в это время всё равно отвечает 403 на защищённые запросы.
 */
export function PasswordChangeGuard() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (user?.mustChangePassword && pathname !== CHANGE_PASSWORD_PATH) {
      router.replace(CHANGE_PASSWORD_PATH)
    }
  }, [user?.mustChangePassword, pathname, router])

  return null
}
