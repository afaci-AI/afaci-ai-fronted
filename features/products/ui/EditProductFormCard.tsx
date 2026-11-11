'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { FieldGroup, Field, FieldLabel, FieldMessage } from '@/shared/ui/field'
import { Spinner } from '@/shared/ui/spinner'
import type { UseEditProductVm } from '../hooks/useEditProduct'

export function EditProductFormCard({ vm }: { vm: UseEditProductVm }) {
  const {
    isSubmitting,
    errors,
    formData,
    categories,
    regions,
    id,
    availableSubcategories,
    handleChange,
    handleSubmit,
  } = vm
  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование продукта</CardTitle>
        <CardDescription>Измените информацию о продукте</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">
                Название <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <FieldMessage variant="error">{errors.name}</FieldMessage>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="category_id">
                Категория <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={formData.category_id}
                onValueChange={(v) => handleChange('category_id', v)}
              >
                <SelectTrigger aria-invalid={!!errors.category_id}>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <FieldMessage variant="error">
                  {errors.category_id}
                </FieldMessage>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="subcategory_id">Подкатегория</FieldLabel>
              <Select
                value={formData.subcategory_id}
                onValueChange={(v) => handleChange('subcategory_id', v)}
                disabled={
                  !formData.category_id || availableSubcategories.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подкатегорию" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="region_id">Регион</FieldLabel>
              <Select
                value={formData.region_id}
                onValueChange={(v) => handleChange('region_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите регион" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href={`/products/${id}`}>Отмена</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}Сохранить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
