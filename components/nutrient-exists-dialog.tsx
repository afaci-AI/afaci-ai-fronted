'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'

interface NutrientExistsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nutrientName: string
  currentQuantity: number
  currentUnit: string
  onUpdate: () => Promise<void>
  onSkip: () => void
}

export function NutrientExistsDialog({
  open,
  onOpenChange,
  nutrientName,
  currentQuantity,
  currentUnit,
  onUpdate,
  onSkip,
}: NutrientExistsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await onUpdate()
      onOpenChange(false)
    } catch (error) {
      toast.error('Не удалось обновить нутриент')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Нутриент уже добавлен</AlertDialogTitle>
          <AlertDialogDescription>
            «{nutrientName}» уже указан в этом продукте: {currentQuantity}{' '}
            {currentUnit}. Обновить его значения?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating} onClick={onSkip}>
            Ничего не делать
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleUpdate()
            }}
            disabled={isUpdating}
          >
            {isUpdating && <Spinner className="mr-2" />}
            Обновить значения
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
