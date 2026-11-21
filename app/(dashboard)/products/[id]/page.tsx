'use client'

import { notFound } from 'next/navigation'
import { AppHeader } from '@/app/_shell/app-header'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { NutrientExistsDialog } from '@/features/products'
import {
  useProductDetail,
  ProductInfoCard,
  ProductNutrientsCard,
  NutrientSheet,
} from '@/features/products'
export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const vm = useProductDetail(params)
  const {
    product,
    loading,
    error,
    nutrientNames,
    units,
    deleteOpen,
    setDeleteOpen,
    duplicateNutrient,
    handleUpdateDuplicate,
    handleSkipDuplicate,
    handleConfirmDelete,
  } = vm

  if (loading) {
    return (
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Продукты', href: '/products' },
          { label: 'Загрузка...' },
        ]}
      />
    )
  }

  if (!product && !error) return notFound()

  if (!product)
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Главная', href: '/dashboard' },
            { label: 'Продукты', href: '/products' },
            { label: 'Ошибка' },
          ]}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        </main>
      </>
    )

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Главная', href: '/dashboard' },
          { label: 'Продукты', href: '/products' },
          { label: product.name },
        ]}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        <div className="space-y-6">
          <ProductInfoCard vm={vm} />

          <ProductNutrientsCard vm={vm} />
        </div>

        <NutrientSheet vm={vm} />

        <NutrientExistsDialog
          open={!!duplicateNutrient}
          onOpenChange={(open) => {
            if (!open) handleSkipDuplicate()
          }}
          nutrientName={
            nutrientNames.find(
              (x) => x.id === duplicateNutrient?.nutrient_name_id,
            )?.name || 'Нутриент'
          }
          currentQuantity={duplicateNutrient?.quantity ?? 0}
          currentUnit={
            units.find((x) => x.id === duplicateNutrient?.unit_id)?.name || ''
          }
          onUpdate={handleUpdateDuplicate}
          onSkip={handleSkipDuplicate}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Удалить нутриент?"
          description="Эта запись о нутриенте будет удалена из продукта."
          onConfirm={handleConfirmDelete}
        />
      </main>
    </>
  )
}
