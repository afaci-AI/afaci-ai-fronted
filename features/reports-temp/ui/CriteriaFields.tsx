'use client'

// TEMP: reports-temp
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { ANY, MAX_TOP } from '../model/report-form'
import type { UseReportsTempVm } from '../hooks/useReportsTemp'

interface PickProps {
  id: string
  label: string
  value: string
  values: string[]
  anyLabel: string
  onChange: (value: string) => void
}

function Pick({ id, label, value, values, anyLabel, onChange }: PickProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || ANY}
        onValueChange={(v) => onChange(v === ANY ? '' : v)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{anyLabel}</SelectItem>
          {values.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ListFields({ vm }: { vm: UseReportsTempVm }) {
  const { form, update, options, subcategoryNames, changeCategory } = vm
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Pick
        id="rt-category"
        label="Категория"
        value={form.category}
        values={options?.categories ?? []}
        anyLabel="Любая"
        onChange={changeCategory}
      />
      <Pick
        id="rt-subcategory"
        label="Подкатегория"
        value={form.subcategory}
        values={subcategoryNames}
        anyLabel="Любая"
        onChange={(subcategory) => update({ subcategory })}
      />
      <Pick
        id="rt-region"
        label="Регион"
        value={form.region}
        values={options?.regions ?? []}
        anyLabel="Любой"
        onChange={(region) => update({ region })}
      />
      <div className="space-y-1.5">
        <Label htmlFor="rt-name">Название содержит</Label>
        <Input
          id="rt-name"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="например, говяд"
        />
      </div>
    </div>
  )
}

export function RankingFields({ vm }: { vm: UseReportsTempVm }) {
  const { form, update, options } = vm
  const nutrients = options?.nutrients ?? []
  const selected = nutrients.find((n) => n.name === form.nutrient)
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="rt-nutrient">Нутриент</Label>
        <Select
          value={form.nutrient}
          onValueChange={(nutrient) => update({ nutrient })}
        >
          <SelectTrigger id="rt-nutrient" className="w-full">
            <SelectValue placeholder="Выберите нутриент" />
          </SelectTrigger>
          <SelectContent>
            {nutrients.map((n) => (
              <SelectItem key={n.name} value={n.name}>
                {n.name} ({n.unit}) — {n.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (
          <p className="text-xs text-muted-foreground">
            Единица: {selected.unit}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rt-order">Порядок</Label>
        <Select
          value={form.order}
          onValueChange={(order) => update({ order: order as 'asc' | 'desc' })}
        >
          <SelectTrigger id="rt-order" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Больше — выше</SelectItem>
            <SelectItem value="asc">Меньше — выше</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rt-top">Количество (N, до {MAX_TOP})</Label>
        <Input
          id="rt-top"
          inputMode="numeric"
          value={form.top}
          onChange={(e) => update({ top: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <Pick
          id="rt-rank-category"
          label="Категория"
          value={form.category}
          values={options?.categories ?? []}
          anyLabel="Любая"
          onChange={(category) => update({ category })}
        />
      </div>
    </div>
  )
}

export function CardFields({ vm }: { vm: UseReportsTempVm }) {
  const { form, candidates, picked, changeName, pickProduct } = vm
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="rt-product">Продукт</Label>
        <Input
          id="rt-product"
          value={form.name}
          onChange={(e) => changeName(e.target.value)}
          placeholder="Начните вводить название"
          autoComplete="off"
        />
      </div>
      {picked ? (
        <p className="text-sm text-muted-foreground">
          Выбрано: {picked.name} · {picked.category} · {picked.region}
        </p>
      ) : (
        candidates.length > 0 && (
          <ul className="divide-y rounded-md border">
            {candidates.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => pickProduct(c)}
                >
                  {c.name}
                  <span className="text-muted-foreground">
                    {' '}
                    · {c.category} · {c.region}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}

export function NutritionFields({ vm }: { vm: UseReportsTempVm }) {
  const { form, update, recipes } = vm
  return (
    <div className="space-y-1.5">
      <Label htmlFor="rt-recipe">Рецептура</Label>
      <Select
        value={form.recipeId}
        onValueChange={(recipeId) => update({ recipeId })}
      >
        <SelectTrigger id="rt-recipe" className="w-full">
          <SelectValue
            placeholder={
              recipes.length ? 'Выберите рецептуру' : 'Нет сохранённых рецептур'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {recipes.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
