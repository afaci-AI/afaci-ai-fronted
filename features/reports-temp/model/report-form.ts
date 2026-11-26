// TEMP: reports-temp
import type { PdfParams } from '../api'

export type ReportKind = 'list' | 'ranking' | 'card' | 'nutrition'

export interface ReportForm {
  category: string
  subcategory: string
  region: string
  name: string
  nutrient: string
  order: 'desc' | 'asc'
  top: string
  productId: string
  recipeId: string
}

export const ANY = '__any__'
export const MAX_TOP = 100

export const emptyForm: ReportForm = {
  category: '',
  subcategory: '',
  region: '',
  name: '',
  nutrient: '',
  order: 'desc',
  top: '20',
  productId: '',
  recipeId: '',
}

export const kindTitles: Record<ReportKind, string> = {
  list: 'Перечень сырья',
  ranking: 'Рейтинг по нутриенту',
  card: 'Карточка сырья',
  nutrition: 'Пищевая ценность рецептуры',
}

export const kindHints: Record<ReportKind, string> = {
  list: 'Сырьё по категории, подкатегории, региону и части названия: белок, жир, углеводы, ккал (до 500 строк).',
  ranking:
    'Топ сырья по выбранному нутриенту — по убыванию или по возрастанию (до 100 позиций).',
  card: 'Полный состав одного продукта по группам: химический, аминокислотный, минеральный.',
  nutrition:
    'Сохранённая рецептура: белок, жир, углеводы, энергоценность и аминокислотный скор на 100 г.',
}

export function parseTop(value: string): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > MAX_TOP) return null
  return n
}

/** Текст ошибки заполнения формы или null, если можно строить отчёт. */
export function validate(kind: ReportKind, form: ReportForm): string | null {
  if (kind === 'ranking') {
    if (!form.nutrient) return 'Выберите нутриент.'
    if (parseTop(form.top) === null)
      return `N должно быть целым числом от 1 до ${MAX_TOP}.`
  }
  if (kind === 'card' && !form.productId) return 'Выберите продукт.'
  if (kind === 'nutrition' && !form.recipeId) return 'Выберите рецептуру.'
  return null
}

export interface PdfRequest {
  path: string
  params: PdfParams
}

export function buildRequest(kind: ReportKind, form: ReportForm): PdfRequest {
  if (kind === 'ranking') {
    return {
      path: '/ranking.pdf',
      params: {
        nutrient: form.nutrient,
        order: form.order,
        top: parseTop(form.top) ?? undefined,
        category: form.category,
      },
    }
  }
  if (kind === 'nutrition') {
    return { path: `/recipes/${form.recipeId}/nutrition.pdf`, params: {} }
  }
  if (kind === 'card') {
    return { path: `/products/${form.productId}.pdf`, params: {} }
  }
  return {
    path: '/products.pdf',
    params: {
      category: form.category,
      subcategory: form.subcategory,
      region: form.region,
      name: form.name,
    },
  }
}
