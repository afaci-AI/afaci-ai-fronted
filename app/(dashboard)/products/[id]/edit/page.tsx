'use client'

import { AppHeader } from '@/app/_shell/app-header'
import { useEditProduct, EditProductFormCard } from '@/features/products'

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const vm = useEditProduct(params)
  const { initialLoading, formData } = vm

  if (initialLoading) {
    return (
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Продукты', href: '/products' },
          { label: 'Редактирование' },
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
          { label: formData.name || 'Редактирование' },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <EditProductFormCard vm={vm} />
        </div>
      </main>
    </>
  )
}
