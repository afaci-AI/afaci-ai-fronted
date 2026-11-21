'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth'
import { useApkDownload } from '@/features/app-versions'
import { baseNavItems, authNavItems } from '../model/site-nav'

export function useSiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { apkUrl, version, showDownload } = useApkDownload()
  const navItems = isAuthenticated
    ? [...baseNavItems, ...authNavItems]
    : baseNavItems

  const handleLogout = () => {
    logout()
    setOpen(false)
    router.push('/')
  }

  return {
    open,
    setOpen,
    user,
    isAuthenticated,
    logout,
    apkUrl,
    version,
    showDownload,
    pathname,
    router,
    navItems,
    handleLogout,
  }
}

export type UseSiteHeaderVm = ReturnType<typeof useSiteHeader>
