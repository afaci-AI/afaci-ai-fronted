'use client'

import Link from 'next/link'
import { Database } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useSiteHeader, SiteHeaderActions } from '@/features/navigation'
import { isActive } from '@/features/navigation'

export function SiteHeader() {
  const vm = useSiteHeader()
  const { pathname, navItems } = vm

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="h-5 w-5" />
          </span>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            AFACI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(pathname, item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side: auth */}
        <SiteHeaderActions vm={vm} />
      </div>
    </header>
  )
}
