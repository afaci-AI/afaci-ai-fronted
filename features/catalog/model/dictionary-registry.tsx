import type {
  Category,
  NutrientClass,
  NutrientName,
  NutrientType,
  Region,
  Subcategory,
  Unit,
} from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge'

import {
  categoriesApi,
  nutrientNamesApi,
  nutrientTypesApi,
  regionsApi,
  subcategoriesApi,
  unitsApi,
} from '../api'
import type { FormField } from '../ui/dictionary-form-drawer'
import type { DictionaryEntity, DictionarySpec } from './dictionary-spec'

type NamePayload = { name: string }

const nameColumn = { key: 'name', label: 'Название', sortable: true }
const idColumn = {
  key: 'id',
  label: 'ID',
  className: 'text-xs text-muted-foreground',
}

function nameField(placeholder: string): FormField {
  return {
    key: 'name',
    label: 'Название',
    type: 'text',
    placeholder,
    required: true,
  }
}

function namePayload(form: Record<string, string>): NamePayload | null {
  return form.name ? { name: form.name } : null
}

function options(items: DictionaryEntity[]) {
  return items.map((item) => ({ value: item.id, label: item.name }))
}

function relationBadge(items: DictionaryEntity[], id: string) {
  const found = items.find((item) => item.id === id)
  return found ? <Badge variant="secondary">{found.name}</Badge> : '—'
}

// ------------------------------------------------ простые справочники (имя)

export const categorySpec: DictionarySpec<Category, NamePayload> = {
  title: 'Категории',
  description: 'Управление категориями продуктов',
  api: categoriesApi,
  columns: () => [nameColumn, idColumn],
  fields: () => [nameField('Введите название категории')],
  payload: namePayload,
  uniqueName: true,
  texts: {
    add: 'Добавить категорию',
    form: 'Заполните информацию о категории',
    empty: 'Нет категорий',
    emptyHint: 'Добавьте первую категорию',
    remove: (item) => `Удалить категорию "${item.name}"?`,
  },
}

export const regionSpec: DictionarySpec<Region, NamePayload> = {
  title: 'Регионы',
  description: 'Управление регионами происхождения продуктов',
  api: regionsApi,
  columns: () => [nameColumn, idColumn],
  fields: () => [nameField('Введите название региона')],
  payload: namePayload,
  texts: {
    add: 'Добавить регион',
    form: 'Заполните информацию о регионе',
    empty: 'Нет регионов',
    emptyHint: 'Добавьте первый регион',
    remove: (item) => `Удалить регион "${item.name}"?`,
  },
}

export const unitSpec: DictionarySpec<Unit, NamePayload> = {
  title: 'Единицы измерения',
  description: 'Управление единицами измерения для нутриентов',
  api: unitsApi,
  columns: () => [nameColumn, idColumn],
  fields: () => [nameField('Например: Грамм')],
  payload: namePayload,
  texts: {
    add: 'Добавить единицу измерения',
    form: 'Заполните информацию о единице',
    empty: 'Нет единиц измерения',
    emptyHint: 'Добавьте первую единицу',
    remove: (item) => `Удалить единицу "${item.name}"?`,
  },
}

export const nutrientTypeSpec: DictionarySpec<NutrientType, NamePayload> = {
  title: 'Типы нутриентов',
  description:
    'Управление типами нутриентов (макронутриенты, витамины, минералы и т.д.)',
  api: nutrientTypesApi,
  columns: () => [nameColumn],
  fields: () => [nameField('Введите название типа')],
  payload: namePayload,
  texts: {
    add: 'Добавить тип нутриента',
    form: 'Заполните информацию о типе',
    empty: 'Нет типов нутриентов',
    emptyHint: 'Добавьте первый тип',
    remove: (item) => `Удалить тип "${item.name}"?`,
  },
}

// ------------------------------------- справочники со связанным справочником

interface Categories {
  categories: Category[]
}

export const subcategorySpec: DictionarySpec<
  Subcategory,
  { name: string; category_id: string },
  Categories
> = {
  title: 'Подкатегории',
  description: 'Управление подкатегориями продуктов',
  api: subcategoriesApi,
  related: {
    initial: { categories: [] },
    load: async () => ({ categories: await categoriesApi.list() }),
  },
  columns: ({ categories }) => [
    nameColumn,
    {
      key: 'category_id',
      label: 'Категория',
      render: (item) => relationBadge(categories, item.category_id),
    },
  ],
  filters: ({ categories }) => [
    { key: 'category_id', label: 'Категория', options: options(categories) },
  ],
  fields: ({ categories }) => [
    nameField('Введите название подкатегории'),
    {
      key: 'category_id',
      label: 'Категория',
      type: 'select',
      placeholder: 'Выберите категорию',
      required: true,
      options: options(categories),
    },
  ],
  payload: (form) =>
    form.name && form.category_id
      ? { name: form.name, category_id: form.category_id }
      : null,
  texts: {
    add: 'Добавить подкатегорию',
    form: 'Заполните информацию о подкатегории',
    empty: 'Нет подкатегорий',
    emptyHint: 'Добавьте первую подкатегорию',
    remove: (item) => `Удалить подкатегорию "${item.name}"?`,
  },
}

const CLASS_LABELS: Record<NutrientClass, string> = {
  macro: 'Макросостав',
  micro: 'Микросостав',
  amino: 'Белок и аминокислоты',
  other: 'Прочее',
}

const CLASS_OPTIONS = (Object.keys(CLASS_LABELS) as NutrientClass[]).map(
  (value) => ({ value, label: CLASS_LABELS[value] }),
)

interface NutrientTypes {
  nutrientTypes: NutrientType[]
}

export const nutrientNameSpec: DictionarySpec<
  NutrientName,
  {
    name: string
    nutrient_type_id: string
    nutrient_class?: NutrientClass
  },
  NutrientTypes
> = {
  title: 'Названия нутриентов',
  description: 'Управление нутриентами (белки, витамины, минералы и т.д.)',
  api: nutrientNamesApi,
  related: {
    initial: { nutrientTypes: [] },
    load: async () => ({ nutrientTypes: await nutrientTypesApi.list() }),
  },
  columns: ({ nutrientTypes }) => [
    nameColumn,
    {
      key: 'nutrient_type_id',
      label: 'Тип',
      render: (item) => relationBadge(nutrientTypes, item.nutrient_type_id),
    },
    {
      key: 'nutrient_class',
      label: 'Класс',
      render: (item) => CLASS_LABELS[item.nutrient_class] ?? '—',
    },
  ],
  filters: ({ nutrientTypes }) => [
    {
      key: 'nutrient_type_id',
      label: 'Тип нутриента',
      options: options(nutrientTypes),
    },
  ],
  fields: ({ nutrientTypes }) => [
    nameField('Введите название нутриента'),
    {
      key: 'nutrient_type_id',
      label: 'Тип нутриента',
      type: 'select',
      placeholder: 'Выберите тип',
      required: true,
      options: options(nutrientTypes),
    },
    {
      key: 'nutrient_class',
      label: 'Класс',
      type: 'select',
      placeholder: 'По типу нутриента',
      options: CLASS_OPTIONS,
    },
  ],
  // Класс уходит на backend, только если выбран; иначе берётся по типу.
  payload: (form) =>
    form.name && form.nutrient_type_id
      ? {
          name: form.name,
          nutrient_type_id: form.nutrient_type_id,
          ...(form.nutrient_class
            ? { nutrient_class: form.nutrient_class as NutrientClass }
            : {}),
        }
      : null,
  texts: {
    add: 'Добавить нутриент',
    form: 'Заполните информацию о нутриенте',
    empty: 'Нет нутриентов',
    emptyHint: 'Добавьте первый нутриент',
    remove: (item) => `Удалить нутриент "${item.name}"?`,
  },
}
