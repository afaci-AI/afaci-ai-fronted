'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react'
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
import { hasPermission } from '@/lib/types'
import { appVersionsApi, type AppVersionAdmin } from '@/modules/app-versions'

interface VersionFormData {
  version: string
  versionCode: string
  changelog: string
  forceUpdate: boolean
  minSupportedVersionCode: string
}

const emptyForm: VersionFormData = {
  version: '',
  versionCode: '',
  changelog: '',
  forceUpdate: false,
  minSupportedVersionCode: '',
}

function toDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export default function AppVersionsPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()

  const [versions, setVersions] = useState<AppVersionAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] =
    useState<AppVersionAdmin | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<VersionFormData>(emptyForm)
  const [errors, setErrors] = useState<
    Partial<Record<keyof VersionFormData, string>>
  >({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null)
  const [uploadedSize, setUploadedSize] = useState<number | null>(null)

  const canManage =
    !!currentUser && hasPermission(currentUser.role, 'canManageUsers')

  const loadVersions = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await appVersionsApi.list()
      setVersions(data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Не удалось загрузить версии',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!currentUser) return
    if (!canManage) {
      router.push('/dashboard')
      return
    }
    ;(async () => {
      await loadVersions()
    })()
  }, [currentUser, canManage, loadVersions, router])

  if (!currentUser || !canManage) {
    return null
  }

  const resetForm = (v?: AppVersionAdmin) => {
    if (v) {
      setFormData({
        version: v.version,
        versionCode: String(v.versionCode),
        changelog: v.changelog ?? '',
        forceUpdate: v.forceUpdate,
        minSupportedVersionCode:
          v.minSupportedVersionCode != null
            ? String(v.minSupportedVersionCode)
            : '',
      })
    } else {
      setFormData(emptyForm)
    }
    setErrors({})
  }

  const handleChange = <K extends keyof VersionFormData>(
    field: K,
    value: VersionFormData[K],
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
    const newErrors: Partial<Record<keyof VersionFormData, string>> = {}
    if (!formData.version.trim()) newErrors.version = 'Версия обязательна'
    if (!formData.versionCode.trim()) {
      newErrors.versionCode = 'Version code обязателен'
    } else if (!/^\d+$/.test(formData.versionCode.trim())) {
      newErrors.versionCode = 'Число'
    }
    if (
      formData.minSupportedVersionCode &&
      !/^\d+$/.test(formData.minSupportedVersionCode.trim())
    ) {
      newErrors.minSupportedVersionCode = 'Число'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUploadApk = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.apk')) {
      toast.error('Файл должен иметь расширение .apk')
      return
    }
    if (file.size === 0) {
      toast.error('Файл пуст')
      return
    }
    setIsUploading(true)
    try {
      const { filename, size } = await appVersionsApi.uploadApk(file)
      setUploadedFilename(filename)
      setUploadedSize(size)
      setCreateOpen(true)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Не удалось загрузить APK',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const created = await appVersionsApi.create({
        version: formData.version.trim(),
        versionCode: Number(formData.versionCode.trim()),
        apkFilename: uploadedFilename ?? '',
        changelog: formData.changelog.trim() || null,
        forceUpdate: formData.forceUpdate,
        minSupportedVersionCode: formData.minSupportedVersionCode
          ? Number(formData.minSupportedVersionCode.trim())
          : null,
        isCurrent: versions.length === 0,
      })
      setVersions((prev) => [created, ...prev])
      toast.success('Версия создана')
      setCreateOpen(false)
      setUploadedFilename(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!selectedVersion) return
    setIsSubmitting(true)
    try {
      const updated = await appVersionsApi.update(selectedVersion.id, {
        version: formData.version.trim(),
        changelog: formData.changelog.trim() || null,
        forceUpdate: formData.forceUpdate,
        minSupportedVersionCode: formData.minSupportedVersionCode
          ? Number(formData.minSupportedVersionCode.trim())
          : null,
      })
      setVersions((prev) =>
        prev.map((v) => (v.id === updated.id ? updated : v)),
      )
      toast.success('Версия обновлена')
      setEditOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEdit = (v: AppVersionAdmin) => {
    setSelectedVersion(v)
    resetForm(v)
    setEditOpen(true)
  }

  const handleSetCurrent = async (v: AppVersionAdmin) => {
    try {
      const updated = await appVersionsApi.setCurrent(v.id)
      setVersions((prev) =>
        prev.map((item) => ({
          ...item,
          isCurrent: item.id === updated.id,
        })),
      )
      toast.success('Версия назначена текущей')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    }
  }

  const handleDelete = (v: AppVersionAdmin) => {
    setSelectedVersion(v)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedVersion) return
    await appVersionsApi.delete(selectedVersion.id)
    setVersions((prev) => prev.filter((v) => v.id !== selectedVersion.id))
  }

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Версии приложения' }]} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Версии приложения
            </h1>
            <p className="text-muted-foreground">
              Управление APK и актуальной версией мобильного приложения
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk,application/vnd.android.package-archive"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleUploadApk(file)
              }
              e.target.value = ''
            }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading && <Spinner className="mr-2" />}
            <Upload className="mr-2 h-4 w-4" />
            Загрузить APK
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Загруженные версии</CardTitle>
            <CardDescription>
              Список всех версий приложения и их статус
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Версия</TableHead>
                    <TableHead>Version code</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Обязательное</TableHead>
                    <TableHead>Изменения</TableHead>
                    <TableHead>Опубликована</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <Spinner className="mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : versions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Версии не загружены
                      </TableCell>
                    </TableRow>
                  ) : (
                    versions.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {v.version}
                            {v.isCurrent && (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {v.versionCode}
                        </TableCell>
                        <TableCell>
                          {v.isCurrent ? (
                            <Badge>Текущая</Badge>
                          ) : (
                            <Badge variant="outline">Архивная</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {v.forceUpdate ? (
                            <Badge variant="destructive">Да</Badge>
                          ) : (
                            <span className="text-muted-foreground">Нет</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <span className="line-clamp-2 text-sm text-muted-foreground">
                            {v.changelog || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {toDate(v.publishedAt)}
                        </TableCell>
                        <TableCell className="text-right">
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
                              {!v.isCurrent && (
                                <DropdownMenuItem
                                  onClick={() => handleSetCurrent(v)}
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  Сделать текущей
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <a
                                  href={v.apkUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Открыть файл
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(v)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(v)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
          </CardContent>
        </Card>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Новая версия</SheetTitle>
              <SheetDescription>
                Заполните данные версии после загрузки APK
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreate} className="mt-6 space-y-4 px-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>APK файл</FieldLabel>
                  <Input value={uploadedFilename ?? ''} disabled readOnly />
                  <p className="text-xs text-muted-foreground">
                    Файл загружен на сервер
                    {uploadedSize ? ` (${formatBytes(uploadedSize)})` : ''}
                  </p>
                </Field>
                <Field>
                  <FieldLabel>Версия *</FieldLabel>
                  <Input
                    placeholder="1.4.0"
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    aria-invalid={!!errors.version}
                  />
                  {errors.version && (
                    <FieldMessage variant="error">
                      {errors.version}
                    </FieldMessage>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Version code *</FieldLabel>
                  <Input
                    type="number"
                    placeholder="14"
                    value={formData.versionCode}
                    onChange={(e) =>
                      handleChange('versionCode', e.target.value)
                    }
                    aria-invalid={!!errors.versionCode}
                  />
                  {errors.versionCode && (
                    <FieldMessage variant="error">
                      {errors.versionCode}
                    </FieldMessage>
                  )}
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
                  Создать
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Редактировать версию</SheetTitle>
              <SheetDescription>Измените данные версии</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleEdit} className="mt-6 space-y-4 px-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Версия *</FieldLabel>
                  <Input
                    placeholder="1.4.0"
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    aria-invalid={!!errors.version}
                  />
                  {errors.version && (
                    <FieldMessage variant="error">
                      {errors.version}
                    </FieldMessage>
                  )}
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
                  onClick={() => setEditOpen(false)}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="mr-2" />}
                  Сохранить
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить версию "${selectedVersion?.version}"?`}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </>
  )
}
