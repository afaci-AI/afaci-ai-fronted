import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} AFACI — База продуктов питания Кыргызстана</p>
          <div className="flex gap-4">
            <Link href="/database" className="hover:text-foreground">База данных</Link>
            <Link href="/calculator" className="hover:text-foreground">Калькулятор</Link>
            <Link href="/about" className="hover:text-foreground">О нас</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
