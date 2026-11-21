'use client'

import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
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
import type { UseProductDetailVm } from '../hooks/useProductDetail'

export function NutrientSheet({ vm }: { vm: UseProductDetailVm }) {
  const {
    nutrientNames,
    units,
    drawerOpen,
    setDrawerOpen,
    selectedNutrient,
    isSubmitting,
    formData,
    errors,
    handleChange,
    handleSaveNutrient,
  } = vm
  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {selectedNutrient ? 'Редактировать нутриент' : 'Добавить нутриент'}
          </SheetTitle>
          <SheetDescription>Укажите нутриент и его количество</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSaveNutrient} className="mt-6 space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Нутриент *</FieldLabel>
              <Select
                value={formData.nutrient_name_id}
                onValueChange={(v) => handleChange('nutrient_name_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите нутриент" />
                </SelectTrigger>
                <SelectContent>
                  {nutrientNames.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nutrient_name_id && (
                <FieldMessage variant="error">
                  {errors.nutrient_name_id}
                </FieldMessage>
              )}
            </Field>
            <Field>
              <FieldLabel>Количество *</FieldLabel>
              <Input
                type="number"
                step="any"
                placeholder="Например: 3.2"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
              />
              {errors.quantity && (
                <FieldMessage variant="error">{errors.quantity}</FieldMessage>
              )}
            </Field>
            <Field>
              <FieldLabel>Единица измерения *</FieldLabel>
              <Select
                value={formData.unit_id}
                onValueChange={(v) => handleChange('unit_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите единицу" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit_id && (
                <FieldMessage variant="error">{errors.unit_id}</FieldMessage>
              )}
            </Field>
          </FieldGroup>
          <SheetFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {selectedNutrient ? 'Сохранить' : 'Добавить'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
