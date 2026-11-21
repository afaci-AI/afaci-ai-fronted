'use client'

import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { UseUsersAdminVm } from '../hooks/useUsersAdmin'

export function UsersFilters({ vm }: { vm: UseUsersAdminVm }) {
  const {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
  } = vm
  return (
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
  )
}
