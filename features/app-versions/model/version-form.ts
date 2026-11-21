export interface VersionFormData {
  changelog: string
  forceUpdate: boolean
  minSupportedVersionCode: string
}

export const emptyForm: VersionFormData = {
  changelog: '',
  forceUpdate: false,
  minSupportedVersionCode: '',
}

export function toDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}
