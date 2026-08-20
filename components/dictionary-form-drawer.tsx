'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldMessage,
} from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

export interface FormField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

interface DictionaryFormDrawerProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: FormField[]
  data?: T | null
  onSave: (data: Record<string, string>) => Promise<void>
  existingValues?: string[]
  duplicateField?: string
}

export function DictionaryFormDrawer<T extends Record<string, unknown>>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  data,
  onSave,
  existingValues = [],
  duplicateField,
}: DictionaryFormDrawerProps<T>) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = !!data

  const buildInitialData = (): Record<string, string> => {
    const initialData: Record<string, string> = {}
    fields.forEach((field) => {
      initialData[field.key] = String(data?.[field.key] ?? '')
    })
    return initialData
  }

  // Сброс формы при открытии: синхронное обновление состояния во время рендера
  // вместо эффекта, чтобы избежать каскадного рендера.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setFormData(data ? buildInitialData() : {})
      setErrors({})
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))

    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.key]?.trim()

      if (field.required && !value) {
        newErrors[field.key] = 'Обязательное поле'
      }

      // Check for duplicates
      if (
        duplicateField &&
        field.key === duplicateField &&
        value &&
        existingValues.includes(value.toLowerCase()) &&
        (!isEdit ||
          value.toLowerCase() !== String(data?.[duplicateField]).toLowerCase())
      ) {
        newErrors[field.key] = 'Такое значение уже существует'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSave(formData)
      toast.success(isEdit ? 'Запись обновлена' : 'Запись добавлена')
      onOpenChange(false)
    } catch (error) {
      toast.error('Произошла ошибка')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Редактирование' : title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FieldGroup>
            {fields.map((field) => (
              <Field key={field.key}>
                <FieldLabel htmlFor={field.key}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FieldLabel>

                {field.type === 'text' && (
                  <Input
                    id={field.key}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    aria-invalid={!!errors[field.key]}
                  />
                )}

                {field.type === 'textarea' && (
                  <Textarea
                    id={field.key}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    aria-invalid={!!errors[field.key]}
                    rows={3}
                  />
                )}

                {field.type === 'select' && field.options && (
                  <Select
                    value={formData[field.key] || ''}
                    onValueChange={(value) => handleChange(field.key, value)}
                  >
                    <SelectTrigger aria-invalid={!!errors[field.key]}>
                      <SelectValue
                        placeholder={field.placeholder || 'Выберите...'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {errors[field.key] && (
                  <FieldMessage variant="error">
                    {errors[field.key]}
                  </FieldMessage>
                )}
              </Field>
            ))}
          </FieldGroup>

          <SheetFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {isEdit ? 'Сохранить' : 'Добавить'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
