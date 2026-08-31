'use client'

import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

interface AppVersionResponse {
  version: string
  apkUrl: string
  changelog?: string
  forceUpdate?: boolean
  minSupportedVersionCode?: number
}

const CACHE_KEY = 'afaci_apk_version'

function readCache(): AppVersionResponse | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppVersionResponse
  } catch {
    return null
  }
}

function writeCache(data: AppVersionResponse) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

function resolveApkUrl(raw: string): string {
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `${window.location.origin}${raw}`
}

function initFromCache(): { apkUrl: string | null; version: string | null } {
  const cached = readCache()
  if (!cached?.apkUrl) return { apkUrl: null, version: null }
  return { apkUrl: resolveApkUrl(cached.apkUrl), version: cached.version }
}

export function useApkDownload() {
  const isMobile = useIsMobile()
  const [apkUrl, setApkUrl] = useState<string | null>(
    () => initFromCache().apkUrl,
  )
  const [version, setVersion] = useState<string | null>(
    () => initFromCache().version,
  )

  useEffect(() => {
    if (!isMobile) return
    if (apkUrl) return

    fetch('/api/v1/app/version')
      .then((res) => {
        if (!res.ok) throw new Error('version fetch failed')
        return res.json() as Promise<AppVersionResponse>
      })
      .then((data) => {
        writeCache(data)
        setApkUrl(resolveApkUrl(data.apkUrl))
        setVersion(data.version)
      })
      .catch(() => {
        setApkUrl(null)
        setVersion(null)
      })
  }, [isMobile, apkUrl])

  return { apkUrl, version, showDownload: isMobile && !!apkUrl }
}
