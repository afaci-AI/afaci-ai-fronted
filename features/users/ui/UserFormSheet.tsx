'use client'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/shared/ui/field'
import { Spinner } from '@/shared/ui/spinner'
import type { UserRole } from '@/shared/api/types'
import type { UseUsersAdminVm } from '../hooks/useUsersAdmin'

export function UserFormSheet({ vm }: { vm: UseUsersAdminVm }) {
  const {
    drawerOpen,
    setDrawerOpen,
    selectedUser,
    isSubmitting,
    formData,
    errors,
    handleChange,
    handleSave,
  } = vm
  return (
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
                  <FieldMessage variant="error">{errors.password}</FieldMessage>
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
  )
}
