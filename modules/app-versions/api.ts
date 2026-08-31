import { fetchApi, getToken } from '@/shared/api/client'

async function uploadFile<T>(endpoint: string, file: File): Promise<T> {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
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

export interface AppVersionCreateData {
  version: string
  versionCode: number
  apkFilename: string
  changelog?: string | null
  forceUpdate?: boolean
  minSupportedVersionCode?: number | null
  isCurrent?: boolean
}

export interface AppVersionUpdateData {
  version?: string
  changelog?: string | null
  forceUpdate?: boolean
  minSupportedVersionCode?: number | null
}

export interface UploadApkResponse {
  filename: string
  url: string
}

export const appVersionsApi = {
  uploadApk: (file: File) =>
    uploadFile<UploadApkResponse>('/admin/app-versions/upload-apk', file),
  list: () => fetchApi<AppVersionAdmin[]>('/admin/app-versions'),
  create: (data: AppVersionCreateData) =>
    fetchApi<AppVersionAdmin>('/admin/app-versions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
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
