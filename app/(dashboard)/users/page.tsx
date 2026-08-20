'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldMessage,
} from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { AppHeader } from '@/components/app-header'
import { DeleteDialog } from '@/components/delete-dialog'
import { useAuth } from '@/lib/auth-context'
import type { UserRole, UserStatus } from '@/lib/types'
import { hasPermission } from '@/lib/types'
import { usersApi, type AdminUser } from '@/modules/users'

const roleLabels: Record<UserRole, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Аналитик',
}

const roleBadgeVariants: Record<UserRole, 'default' | 'secondary' | 'outline'> =
  {
    admin: 'default',
    editor: 'secondary',
    viewer: 'outline',
  }

const statusLabels: Record<UserStatus, string> = {
  active: 'Активен',
  unlimited: 'Безлимитный',
  blocked: 'Заблокирован',
  expired: 'Истёк',
}

const statusBadgeVariants: Record<
  UserStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'outline',
  unlimited: 'outline',
  blocked: 'secondary',
  expired: 'destructive',
}

const EXPIRY_SOON_DAYS = 3

function isExpiringSoon(accessExpiresAt: string | null): boolean {
  if (!accessExpiresAt) return false
  const diffMs = new Date(accessExpiresAt).getTime() - Date.now()
  return diffMs > 0 && diffMs <= EXPIRY_SOON_DAYS * 24 * 60 * 60 * 1000
}

// datetime-local не понимает временную зону — приводим к локальному "YYYY-MM-DDTHH:mm".
function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: UserRole
  unlimited: boolean
  accessExpiresAt: string
}

const emptyForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'viewer',
  unlimited: true,
  accessExpiresAt: '',
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)
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

  if (!currentUser || !canManage) {
    return null
  }

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
        password: '',
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
    if (!selectedUser && formData.password.trim().length < 6) {
      newErrors.password = 'Пароль должен быть не короче 6 символов'
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
        const created = await usersApi.create({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role,
          access_expires_at: accessExpiresAtIso,
          must_change_password: true,
        })
        setUsers((prev) => [created, ...prev])
        toast.success('Пользователь создан')
      }
      setDrawerOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
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

  const handleDeletePermanently = (user: AdminUser) => {
    setSelectedUser(user)
    setPermanentDeleteOpen(true)
  }

  const handleConfirmDeletePermanently = async () => {
    if (!selectedUser) return
    try {
      await usersApi.deletePermanently(selectedUser.id)
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
      toast.success('Пользователь и все его рецептуры удалены')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setSelectedUser(null)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Пользователи' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Пользователи</CardTitle>
              <CardDescription>
                Управление пользователями, ролями и сроком доступа
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDrawer()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Создать пользователя
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  placeholder="Поиск по имени или email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="editor">Редактор</SelectItem>
                  <SelectItem value="viewer">Аналитик</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="unlimited">Безлимитные</SelectItem>
                  <SelectItem value="expired">Истёкшие</SelectItem>
                  <SelectItem value="blocked">Заблокированные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Доступ до</TableHead>
                    <TableHead>Создан</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <Spinner className="mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Пользователи не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className={!user.isActive ? 'opacity-60' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                              <span className="text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeVariants[user.role]}>
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariants[user.status]}>
                            {statusLabels[user.status]}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={
                            isExpiringSoon(user.accessExpiresAt)
                              ? 'font-medium text-amber-600'
                              : 'text-muted-foreground'
                          }
                        >
                          {user.accessExpiresAt
                            ? new Date(user.accessExpiresAt).toLocaleDateString(
                                'ru-RU',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )
                            : 'Безлимитно'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString(
                            'ru-RU',
                            { day: 'numeric', month: 'short', year: 'numeric' },
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenDrawer(user)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user)}
                                disabled={user.id === currentUser?.id}
                              >
                                <Power className="mr-2 h-4 w-4" />
                                {user.isActive
                                  ? 'Деактивировать'
                                  : 'Активировать'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeletePermanently(user)}
                                className="text-destructive"
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить безвозвратно
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Показано: {filteredUsers.length} из {users.length}
            </div>
          </CardContent>
        </Card>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {selectedUser
                  ? 'Редактировать пользователя'
                  : 'Создать пользователя'}
              </SheetTitle>
              <SheetDescription>
                {selectedUser
                  ? 'Измените данные пользователя'
                  : 'Заполните данные нового пользователя'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSave} className="mt-6 space-y-4 px-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Имя *</FieldLabel>
                  <Input
                    placeholder="Введите имя"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <FieldMessage variant="error">{errors.name}</FieldMessage>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Email *</FieldLabel>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    aria-invalid={!!errors.email}
                    disabled={!!selectedUser}
                  />
                  {errors.email && (
                    <FieldMessage variant="error">{errors.email}</FieldMessage>
                  )}
                </Field>

                {!selectedUser && (
                  <Field>
                    <FieldLabel>Временный пароль *</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Минимум 6 символов"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && (
                      <FieldMessage variant="error">
                        {errors.password}
                      </FieldMessage>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Пользователю потребуется сменить пароль при первом входе.
                    </p>
                  </Field>
                )}

                <Field>
                  <FieldLabel>Роль *</FieldLabel>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => handleChange('role', v as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Администратор</Badge>
                          <span className="text-xs text-muted-foreground">
                            Полный доступ
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Редактор</Badge>
                          <span className="text-xs text-muted-foreground">
                            Редактирование данных
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Аналитик</Badge>
                          <span className="text-xs text-muted-foreground">
                            Только просмотр
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Безлимитный доступ</FieldLabel>
                    <Switch
                      checked={formData.unlimited}
                      onCheckedChange={(checked) =>
                        handleChange('unlimited', checked)
                      }
                    />
                  </div>
                  {!formData.unlimited && (
                    <>
                      <Input
                        type="datetime-local"
                        value={formData.accessExpiresAt}
                        onChange={(e) =>
                          handleChange('accessExpiresAt', e.target.value)
                        }
                        aria-invalid={!!errors.accessExpiresAt}
                      />
                      {errors.accessExpiresAt && (
                        <FieldMessage variant="error">
                          {errors.accessExpiresAt}
                        </FieldMessage>
                      )}
                    </>
                  )}
                </Field>
              </FieldGroup>

              <SheetFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDrawerOpen(false)}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="mr-2" />}
                  {selectedUser ? 'Сохранить' : 'Создать'}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <DeleteDialog
          open={permanentDeleteOpen}
          onOpenChange={setPermanentDeleteOpen}
          title={`Удалить пользователя "${selectedUser?.name}" безвозвратно?`}
          description="Будут удалены сам пользователь, все его группы и сохранённые рецептуры. Это действие нельзя отменить."
          onConfirm={handleConfirmDeletePermanently}
        />
      </main>
    </>
  )
}
