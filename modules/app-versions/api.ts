import { fetchApi, getToken } from '@/shared/api/client'

async function uploadFile<T>(
  endpoint: string,
  file: File,
  fields: Record<string, string> = {},
): Promise<T> {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  const res = await fetch(`/api/v1${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export interface AppVersionAdmin {
  id: string
  version: string
  versionCode: number
  apkUrl: string
  apkFilename: string
  changelog: string | null
  forceUpdate: boolean
  minSupportedVersionCode: number | null
  isCurrent: boolean
  publishedAt: string
}

export interface AppVersionUpdateData {
  changelog?: string | null
  forceUpdate?: boolean
  minSupportedVersionCode?: number | null
}

export interface UploadApkOptions {
  forceUpdate: boolean
  changelog?: string | null
  minSupportedVersionCode?: number | null
}

export const appVersionsApi = {
  // versionName/versionCode backend читает из самого APK и публикует версию.
  uploadApk: (file: File, options: UploadApkOptions) =>
    uploadFile<AppVersionAdmin>('/admin/app-versions/upload-apk', file, {
      forceUpdate: String(options.forceUpdate),
      ...(options.changelog ? { changelog: options.changelog } : {}),
      ...(options.minSupportedVersionCode != null
        ? {
            minSupportedVersionCode: String(options.minSupportedVersionCode),
          }
        : {}),
    }),
  list: () => fetchApi<AppVersionAdmin[]>('/admin/app-versions'),
  update: (id: string, data: AppVersionUpdateData) =>
    fetchApi<AppVersionAdmin>(`/admin/app-versions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  setCurrent: (id: string) =>
    fetchApi<AppVersionAdmin>(`/admin/app-versions/${id}/current`, {
      method: 'PATCH',
    }),
  delete: (id: string) =>
    fetchApi<{ status: string }>(`/admin/app-versions/${id}`, {
      method: 'DELETE',
    }),
}
