'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth'
import { hasPermission } from '@/shared/api/types'
import { appVersionsApi, type AppVersionAdmin } from '../api'
import { VersionFormData, emptyForm } from '../model/version-form'

export function useAppVersionsAdmin() {
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
  const [pendingFile, setPendingFile] = useState<File | null>(null)

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

  const resetForm = (v?: AppVersionAdmin) => {
    if (v) {
      setFormData({
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
    if (
      formData.minSupportedVersionCode &&
      !/^\d+$/.test(formData.minSupportedVersionCode.trim())
    ) {
      newErrors.minSupportedVersionCode = 'Число'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSelectApk = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.apk')) {
      toast.error('Файл должен иметь расширение .apk')
      return
    }
    if (file.size === 0) {
      toast.error('Файл пуст')
      return
    }
    setPendingFile(file)
    resetForm()
    setCreateOpen(true)
  }

  // Версия и код читаются backend из APK; здесь задаётся только обязательность.
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingFile || !validate()) return
    setIsSubmitting(true)
    setIsUploading(true)
    try {
      const created = await appVersionsApi.uploadApk(pendingFile, {
        forceUpdate: formData.forceUpdate,
        changelog: formData.changelog.trim() || null,
        minSupportedVersionCode: formData.minSupportedVersionCode
          ? Number(formData.minSupportedVersionCode.trim())
          : null,
      })
      setVersions((prev) => [
        created,
        ...prev.map((item) => ({ ...item, isCurrent: false })),
      ])
      toast.success(`Версия ${created.version} опубликована`)
      setCreateOpen(false)
      setPendingFile(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Не удалось загрузить APK',
      )
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!selectedVersion) return
    setIsSubmitting(true)
    try {
      const updated = await appVersionsApi.update(selectedVersion.id, {
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
    // Если удалена текущая, backend назначает текущей версию с наибольшим кодом.
    const rest = versions.filter((v) => v.id !== selectedVersion.id)
    if (selectedVersion.isCurrent && rest.length > 0) {
      const latest = rest.reduce((a, b) =>
        b.versionCode > a.versionCode ? b : a,
      )
      setVersions(rest.map((v) => ({ ...v, isCurrent: v.id === latest.id })))
    } else {
      setVersions(rest)
    }
  }

  return {
    versions,
    setVersions,
    isLoading,
    setIsLoading,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    selectedVersion,
    setSelectedVersion,
    isSubmitting,
    setIsSubmitting,
    formData,
    setFormData,
    errors,
    setErrors,
    isUploading,
    setIsUploading,
    pendingFile,
    setPendingFile,
    currentUser,
    router,
    fileInputRef,
    canManage,
    loadVersions,
    resetForm,
    handleChange,
    validate,
    handleSelectApk,
    handleCreate,
    handleEdit,
    handleOpenEdit,
    handleSetCurrent,
    handleDelete,
    handleConfirmDelete,
  }
}

export type UseAppVersionsAdminVm = ReturnType<typeof useAppVersionsAdmin>
