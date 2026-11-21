'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth'
import { hasPermission } from '@/shared/api/types'
import { usersApi, type AdminUser } from '../api'
import {
  toDatetimeLocalValue,
  UserFormData,
  emptyForm,
} from '../model/user-form'

export function useUsersAdmin() {
  const { user: currentUser } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<UserFormData>(emptyForm)
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({})

  const canManage =
    !!currentUser && hasPermission(currentUser.role, 'canManageUsers')

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    try {
      const data = await usersApi.list()
      setUsers(data)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить пользователей',
      )
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    if (!currentUser) return
    if (!canManage) {
      router.push('/dashboard')
      return
    }
    ;(async () => {
      await loadUsers()
    })()
  }, [currentUser, canManage, loadUsers, router])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      search === '' ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleOpenDrawer = (user?: AdminUser) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        unlimited: !user.accessExpiresAt,
        accessExpiresAt: toDatetimeLocalValue(user.accessExpiresAt),
      })
    } else {
      setSelectedUser(null)
      setFormData(emptyForm)
    }
    setErrors({})
    setDrawerOpen(true)
  }

  const handleChange = <K extends keyof UserFormData>(
    field: K,
    value: UserFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const e = { ...prev }
        delete e[field]
        return e
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {}
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно'
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email'
    }
    if (!selectedUser && users.some((u) => u.email === formData.email)) {
      newErrors.email = 'Пользователь с таким email уже существует'
    }
    if (!formData.unlimited && !formData.accessExpiresAt) {
      newErrors.accessExpiresAt = 'Укажите дату окончания доступа'
    } else if (
      !formData.unlimited &&
      new Date(formData.accessExpiresAt).getTime() <= Date.now()
    ) {
      newErrors.accessExpiresAt =
        'Дата окончания доступа не может быть в прошлом'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const accessExpiresAtIso =
        formData.unlimited || !formData.accessExpiresAt
          ? null
          : new Date(formData.accessExpiresAt).toISOString()

      if (selectedUser) {
        const updated = await usersApi.update(selectedUser.id, {
          name: formData.name,
          role: formData.role,
          access_expires_at_unlimited: formData.unlimited,
          access_expires_at: formData.unlimited
            ? undefined
            : accessExpiresAtIso,
        })
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        toast.success('Пользователь обновлён')
      } else {
        const { credentialsEmail, ...created } = await usersApi.create({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          access_expires_at: accessExpiresAtIso,
        })
        setUsers((prev) => [created, ...prev])
        if (credentialsEmail.sent) {
          toast.success('Пользователь создан', {
            description: `Логин и временный пароль отправлены на ${created.email}`,
          })
        } else {
          toast.warning('Пользователь создан, но письмо не отправлено', {
            description: `${credentialsEmail.error ?? ''} Повторите отправку из меню пользователя.`,
            duration: 10000,
          })
        }
      }
      setDrawerOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCredentials = async (user: AdminUser) => {
    try {
      const updated = await usersApi.resendCredentials(user.id)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      toast.success('Новый временный пароль отправлен', {
        description: `Письмо ушло на ${updated.email}; прежний пароль больше не действует.`,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      if (user.isActive) {
        await usersApi.deactivate(user.id)
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isActive: false, status: 'blocked' } : u,
          ),
        )
        toast.success('Пользователь деактивирован')
      } else {
        const updated = await usersApi.update(user.id, { is_active: true })
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
        toast.success('Пользователь активирован')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    }
  }

  return {
    users,
    setUsers,
    isLoadingUsers,
    setIsLoadingUsers,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    drawerOpen,
    setDrawerOpen,
    selectedUser,
    setSelectedUser,
    isSubmitting,
    setIsSubmitting,
    formData,
    setFormData,
    errors,
    setErrors,
    currentUser,
    router,
    canManage,
    loadUsers,
    filteredUsers,
    handleOpenDrawer,
    handleChange,
    validate,
    handleSave,
    handleToggleStatus,
    handleResendCredentials,
  }
}

export type UseUsersAdminVm = ReturnType<typeof useUsersAdmin>
