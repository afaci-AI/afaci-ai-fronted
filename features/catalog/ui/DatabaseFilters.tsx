'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { ALL } from '../model/stored-filters'
import type { UseDatabaseBrowserVm } from '../hooks/useDatabaseBrowser'

export function DatabaseFilters({ vm }: { vm: UseDatabaseBrowserVm }) {
  const {
    categories,
    regions,
    query,
    setQuery,
    category,
    subcategory,
    setSubcategory,
    region,
    setRegion,
    subcategoryOptions,
    handleCategoryChange,
    hasActiveFilters,
    resetFilters,
  } = vm
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию продукта..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 md:flex md:w-auto">
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все категории</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={subcategory}
          onValueChange={setSubcategory}
          disabled={subcategoryOptions.length === 0}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Подкатегория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все подкатегории</SelectItem>
            {subcategoryOptions.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Регион" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все регионы</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="destructive"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="col-span-2 md:col-span-1"
        >
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      </div>
    </div>
  )
}
