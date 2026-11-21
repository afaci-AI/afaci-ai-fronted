'use client'

import { AppHeader } from '@/app/_shell/app-header'
import { useNewProduct, NewProductFormCard } from '@/features/products'

export default function NewProductPage() {
  const vm = useNewProduct()
  const { loading } = vm

  if (loading) {
    return (
      <AppHeader
        breadcrumbs={[
          { label: 'Глав��ая', href: '/dashboard' },
          { label: 'Продукты', href: '/products' },
          { label: 'Новый продукт' },
        ]}
      />
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Продукты', href: '/products' },
          { label: 'Новый продукт' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <NewProductFormCard vm={vm} />
        </div>
      </main>
    </>
  )
}
