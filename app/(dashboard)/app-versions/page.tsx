'use client'

import { AppHeader } from '@/app/_shell/app-header'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import {
  useAppVersionsAdmin,
  AppVersionsHeader,
  AppVersionsList,
  CreateVersionSheet,
  EditVersionSheet,
} from '@/features/app-versions'

export default function AppVersionsPage() {
  const vm = useAppVersionsAdmin()
  const {
    deleteOpen,
    setDeleteOpen,
    selectedVersion,
    currentUser,
    canManage,
    handleConfirmDelete,
  } = vm

  if (!currentUser || !canManage) {
    return null
  }

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Версии приложения' }]} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <AppVersionsHeader vm={vm} />

        <AppVersionsList vm={vm} />

        <CreateVersionSheet vm={vm} />

        <EditVersionSheet vm={vm} />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Удалить версию "${selectedVersion?.version}"?`}
          description={
            selectedVersion?.isCurrent
              ? 'Это текущая версия. После удаления текущей станет версия с наибольшим кодом. APK-файл будет удалён с сервера.'
              : 'APK-файл будет удалён с сервера. Это действие нельзя отменить.'
          }
          onConfirm={handleConfirmDelete}
        />
      </main>
    </>
  )
}
