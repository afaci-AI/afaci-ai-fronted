'use client'

import { MoreHorizontal, Pencil, Power } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Spinner } from '@/shared/ui/spinner'
import {
  roleLabels,
  roleBadgeVariants,
  statusLabels,
  statusBadgeVariants,
  isExpiringSoon,
} from '../model/user-form'
import type { UseUsersAdminVm } from '../hooks/useUsersAdmin'

export function UsersTable({ vm }: { vm: UseUsersAdminVm }) {
  const {
    isLoadingUsers,
    currentUser,
    filteredUsers,
    handleOpenDrawer,
    handleToggleStatus,
  } = vm
  return (
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
                  {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
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
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {user.isActive ? 'Деактивировать' : 'Активировать'}
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
  )
}
