'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, MoreHorizontal, Pencil, Power, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { AppHeader } from '@/components/app-header'
import { DeleteDialog } from '@/components/delete-dialog'
import { useAuth } from '@/lib/auth-context'
import type { User, UserRole } from '@/lib/types'
import { hasPermission } from '@/lib/types'

const roleLabels: Record<UserRole, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Аналитик',
}

const roleBadgeVariants: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  editor: 'secondary',
  viewer: 'outline',
}

interface UserFormData {
  name: string
  email: string
  role: UserRole
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()

  if (!currentUser || !hasPermission(currentUser.role, 'canManageUsers')) {
    router.push('/dashboard')
    return null
  }

  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({ name: '', email: '', role: 'viewer' })
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      search === '' ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleOpenDrawer = (user?: User) => {
    if (user) {
      setSelectedUser(user)
      setFormData({ name: user.name, email: user.email, role: user.role })
    } else {
      setSelectedUser(null)
      setFormData({ name: '', email: '', role: 'viewer' })
    }
    setErrors({})
    setDrawerOpen(true)
  }

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => { const e = { ...prev }; delete e[field]; return e })
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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      if (selectedUser) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? { ...u, name: formData.name, email: formData.email, role: formData.role }
              : u
          )
        )
        toast.success('Пользователь обновлён')
      } else {
        const newUser: User = {
          id: String(Date.now()),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
        setUsers((prev) => [newUser, ...prev])
        toast.success('Приглашение отправлено')
      }
      setDrawerOpen(false)
    } catch {
      toast.error('Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (user: User) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
    toast.success(user.isActive ? 'Пользователь деактивирован' : 'Пользователь активирован')
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser?.id))
    setSelectedUser(null)
  }

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Главная', href: '/dashboard' }, { label: 'Пользователи' }]} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Пользователи</CardTitle>
              <CardDescription>Управление пользователями и их правами доступа</CardDescription>
            </div>
            <Button onClick={() => handleOpenDrawer()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Пригласить
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
                  <SelectItem value="inactive">Неактивные</SelectItem>
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
                    <TableHead>Последний вход</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Пользователи не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                              <span className="text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeVariants[user.role]}>{roleLabels[user.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'outline' : 'secondary'}>
                            {user.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('ru-RU', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDrawer(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                <Power className="mr-2 h-4 w-4" />
                                {user.isActive ? 'Деактивировать' : 'Активировать'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(user)}
                                className="text-destructive"
                                disabled={user.id === currentUser?.id}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Удалить
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
              <SheetTitle>{selectedUser ? 'Редактировать пользователя' : 'Пригласить пользователя'}</SheetTitle>
              <SheetDescription>
                {selectedUser ? 'Измените данные пользователя' : 'Отправьте приглашение новому пользователю'}
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
                  {errors.name && <FieldMessage variant="error">{errors.name}</FieldMessage>}
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
                  {errors.email && <FieldMessage variant="error">{errors.email}</FieldMessage>}
                </Field>

                <Field>
                  <FieldLabel>Роль *</FieldLabel>
                  <Select value={formData.role} onValueChange={(v) => handleChange('role', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Администратор</Badge>
                          <span className="text-xs text-muted-foreground">Полный доступ</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Редактор</Badge>
                          <span className="text-xs text-muted-foreground">Редактирование данных</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Аналитик</Badge>
                          <span className="text-xs text-muted-foreground">Только просмотр</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <SheetFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)} disabled={isSubmitting}>
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="mr-2" />}
                  {selectedUser ? 'Сохранить' : 'Отправить приглашение'}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить пользователя "${selectedUser?.name}"?`}
          description="Пользователь потеряет доступ к системе. Это действие нельзя отменить."
          onConfirm={handleConfirmDelete}
        />
      </main>
    </>
  )
}
