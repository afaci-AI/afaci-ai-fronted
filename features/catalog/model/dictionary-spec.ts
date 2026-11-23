import type { Column, Filter } from '@/shared/ui/data-table'

import type { FormField } from '../ui/dictionary-form-drawer'

/** Запись любого справочника: идентификатор и отображаемое имя. */
export interface DictionaryEntity {
  id: string
  name: string
}

/** Что сценарию справочника нужно от HTTP-слоя, и ничего больше. */
export interface DictionaryApi<T extends DictionaryEntity, P> {
  list: () => Promise<T[]>
  create: (payload: P) => Promise<T>
  update: (id: string, payload: P) => Promise<T>
  delete: (id: string) => Promise<void>
}

/**
 * Связанные справочники для колонок, фильтров и полей формы.
 * `initial` нужен, чтобы первый рендер шёл без проверок на undefined.
 */
export interface DictionaryRelated<R extends object> {
  initial: R
  load: () => Promise<R>
}

/** Подписи справочника. Правка в форме озаглавлена ящиком как «Редактирование». */
export interface DictionaryTexts<T extends DictionaryEntity> {
  add: string
  form: string
  empty: string
  emptyHint: string
  remove: (item: T) => string
  search?: string
}

/**
 * Описание справочника данными: один объект — одна страница.
 * Новый справочник добавляется спецификацией, без правки экрана и хука.
 */
export interface DictionarySpec<
  T extends DictionaryEntity,
  P,
  R extends object = Record<string, never>,
> {
  /** Заголовок карточки и подпись в хлебных крошках. */
  title: string
  description: string
  api: DictionaryApi<T, P>
  related?: DictionaryRelated<R>
  columns: (related: R) => Column<T>[]
  filters?: (related: R) => Filter[]
  fields: (related: R) => FormField[]
  /** Форма → тело запроса; `null`, если обязательные поля не заполнены. */
  payload: (form: Record<string, string>) => P | null
  texts: DictionaryTexts<T>
  /** Проверять в форме, что такое имя уже существует. */
  uniqueName?: boolean
}

export function dictionaryBreadcrumbs(spec: { title: string }) {
  return [
    { label: 'Главная', href: '/dashboard' },
    { label: 'Справочники', href: '/dictionaries/categories' },
    { label: spec.title },
  ]
}
