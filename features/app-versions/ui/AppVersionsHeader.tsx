'use client'

import { Upload } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Spinner } from '@/shared/ui/spinner'
import type { UseAppVersionsAdminVm } from '../hooks/useAppVersionsAdmin'

export function AppVersionsHeader({ vm }: { vm: UseAppVersionsAdminVm }) {
  const { isUploading, fileInputRef, handleSelectApk } = vm
  return (
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
            handleSelectApk(file)
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
  )
}
