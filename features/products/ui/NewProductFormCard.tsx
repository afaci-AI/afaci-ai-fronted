'use client'

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
import type { UseNewProductVm } from '../hooks/useNewProduct'

export function NewProductFormCard({ vm }: { vm: UseNewProductVm }) {
  const {
    isSubmitting,
    errors,
    formData,
    categories,
    regions,
    router,
    availableSubcategories,
    handleChange,
    handleSubmit,
  } = vm
  return (
    <Card>
      <CardHeader>
        <CardTitle>Новый продукт</CardTitle>
        <CardDescription>
          Заполните информацию о продукте. После создания можно добавить
          нутриенты.
        </CardDescription>
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
                placeholder="Например: Молоко коровье 3.2%"
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
                onValueChange={(value) => handleChange('category_id', value)}
              >
                <SelectTrigger aria-invalid={!!errors.category_id}>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
                onValueChange={(value) => handleChange('subcategory_id', value)}
                disabled={
                  !formData.category_id || availableSubcategories.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.category_id
                        ? 'Сначала выберите категорию'
                        : availableSubcategories.length === 0
                          ? 'Нет подкатегорий'
                          : 'Выберите подкатегорию'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="region_id">Регион</FieldLabel>
              <Select
                value={formData.region_id}
                onValueChange={(value) => handleChange('region_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите регион" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              Создать продукт
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
