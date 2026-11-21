'use client'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
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
import { formatBytes } from '../model/version-form'
import type { UseAppVersionsAdminVm } from '../hooks/useAppVersionsAdmin'

export function CreateVersionSheet({ vm }: { vm: UseAppVersionsAdminVm }) {
  const {
    createOpen,
    setCreateOpen,
    isSubmitting,
    formData,
    errors,
    pendingFile,
    handleChange,
    handleCreate,
  } = vm
  return (
    <Sheet open={createOpen} onOpenChange={setCreateOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Новая версия</SheetTitle>
          <SheetDescription>
            Версия и код будут прочитаны из APK. Версия публикуется только если
            её код выше всех загруженных
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleCreate} className="mt-6 space-y-4 px-4">
          <FieldGroup>
            <Field>
              <FieldLabel>APK файл</FieldLabel>
              <Input value={pendingFile?.name ?? ''} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                {pendingFile ? formatBytes(pendingFile.size) : ''}
              </p>
            </Field>
            <Field>
              <FieldLabel>Changelog</FieldLabel>
              <Input
                placeholder="Исправлены баги"
                value={formData.changelog}
                onChange={(e) => handleChange('changelog', e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Минимальная поддерживаемая версия</FieldLabel>
              <Input
                type="number"
                placeholder="10"
                value={formData.minSupportedVersionCode}
                onChange={(e) =>
                  handleChange('minSupportedVersionCode', e.target.value)
                }
                aria-invalid={!!errors.minSupportedVersionCode}
              />
              {errors.minSupportedVersionCode && (
                <FieldMessage variant="error">
                  {errors.minSupportedVersionCode}
                </FieldMessage>
              )}
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Обязательное обновление</FieldLabel>
                <Switch
                  checked={formData.forceUpdate}
                  onCheckedChange={(checked) =>
                    handleChange('forceUpdate', checked)
                  }
                />
              </div>
            </Field>
          </FieldGroup>
          <SheetFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              Опубликовать
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
