/**
 * Разбор пользовательского ввода числа.
 * Принимает и точку, и запятую как десятичный разделитель,
 * игнорирует пробелы и неразрывные пробелы (их подставляет numpad).
 * Возвращает null для пустой строки и для нечислового ввода,
 * чтобы вызывающий код сам выбрал фолбэк, а не получил молчаливый 0.
 */
export function parseNumberInput(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  if (normalized === '') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Число → строка для поля ввода: десятичный разделитель всегда запятая,
 * чтобы загруженные из БД значения выглядели так же, как введённые вручную.
 */
export function toInputValue(
  n: number | null | undefined,
  fractionDigits?: number,
): string {
  if (n === null || n === undefined || Number.isNaN(n)) return ''
  const s = fractionDigits != null ? n.toFixed(fractionDigits) : String(n)
  return s.replace('.', ',')
}

/**
 * Очистка ввода: только цифры и разделитель, разделитель максимум один,
 * точка приводится к запятой. Ведущий разделитель сохраняется — иначе «,5»
 * с мобильной клавиатуры превратился бы в «5» вместо «0,5».
 * Минус отбрасывается: во всех полях min=0.
 * Пустая строка и одиночный разделитель допустимы — это промежуточные
 * состояния при наборе, парсер вернёт для них null.
 */
export function sanitizeNumericInput(raw: string): string {
  let digits = ''

  for (const char of raw) {
    if (char === ',' || char === '.') {
      if (!digits.includes(',')) digits += ','
    } else if (char >= '0' && char <= '9') {
      digits += char
    }
  }

  return digits
}
