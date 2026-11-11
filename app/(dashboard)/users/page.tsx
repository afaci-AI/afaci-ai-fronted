'use client'

import { UserPlus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { AppHeader } from '@/app/_shell/app-header'
import {
  useUsersAdmin,
  UsersFilters,
  UsersTable,
  UserFormSheet,
} from '@/features/users'

export default function UsersPage() {
  const vm = useUsersAdmin()
  const { users, currentUser, canManage, filteredUsers, handleOpenDrawer } = vm

  if (!currentUser || !canManage) {
    return null
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
            <UsersFilters vm={vm} />

            <UsersTable vm={vm} />

            <div className="mt-4 text-sm text-muted-foreground">
              Показано: {filteredUsers.length} из {users.length}
            </div>
          </CardContent>
        </Card>

        <UserFormSheet vm={vm} />
      </main>
    </>
  )
}
