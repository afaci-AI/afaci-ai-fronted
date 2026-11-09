'use client'

import Link from 'next/link'
import {
  Database,
  Download,
  Menu,
  LogOut,
  LayoutDashboard,
  User,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { isActive, initials, apkDownloadName } from '../model/site-nav'
import type { UseSiteHeaderVm } from '../hooks/useSiteHeader'

export function SiteHeaderActions({ vm }: { vm: UseSiteHeaderVm }) {
  const {
    open,
    setOpen,
    user,
    isAuthenticated,
    apkUrl,
    version,
    showDownload,
    pathname,
    navItems,
    handleLogout,
  } = vm
  return (
    <div className="ml-auto flex items-center gap-2">
      {isAuthenticated && user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {user.name}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Админ-панель
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild className="hidden md:inline-flex">
          <Link href="/login">Войти</Link>
        </Button>
      )}

      {/* Mobile menu trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Меню"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Database className="h-4 w-4" />
              </span>
              AFACI
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(pathname, item.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {showDownload && apkUrl && (
            <div className="px-3 pb-1">
              <Button asChild className="w-full justify-start gap-2">
                <a
                  href={apkUrl}
                  download={apkDownloadName(version)}
                  onClick={() => setOpen(false)}
                >
                  <Download className="h-4 w-4" />
                  <span className="flex-1">Скачать мобильное приложение</span>
                  {version && (
                    <span className="text-xs text-primary-foreground/70">
                      v{version}
                    </span>
                  )}
                </a>
              </Button>
            </div>
          )}

          <div className="border-t border-border p-3">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-1 py-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Админ-панель
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </Button>
              </div>
            ) : (
              <Button asChild className="w-full">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <User className="mr-2 h-4 w-4" />
                  Войти
                </Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
