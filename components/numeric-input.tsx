'use client'

import type * as React from 'react'
import { Input } from '@/components/ui/input'
import { sanitizeNumericInput } from '@/lib/number'

interface NumericInputProps extends Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value' | 'type'
> {
  value: string
  onValueChange: (value: string) => void
}

/**
 * Поле ввода вещественного числа. Точка и запятая равноправны: обе
 * сохраняются ровно в том виде, в каком набраны, без нормализации на лету.
 *
 * type="number" здесь неприменим: браузер отбрасывает запятую на уровне DOM,
 * и в e.target.value приходит пустая строка. Поэтому text + inputMode="decimal",
 * а значение очищается на лету и отдаётся наружу строкой.
 */
export function NumericInput({
  value,
  onValueChange,
  className,
  ...props
}: NumericInputProps) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      data-slot="numeric-input"
      className={className}
      value={value}
      onChange={(e) => onValueChange(sanitizeNumericInput(e.target.value))}
      {...props}
    />
  )
}
