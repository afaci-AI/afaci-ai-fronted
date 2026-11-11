'use client'

import Link from 'next/link'
import { Pencil, Trash2, FolderInput } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { FilterButton, Metric, CreateGroupDialog } from './SavedParts'
import { ALL, NONE, nf } from '../model/recipes-list'
import type { UseSavedRecipesVm } from '../hooks/useSavedRecipes'

export function SavedRecipesGrid({ vm }: { vm: UseSavedRecipesVm }) {
  const {
    groups,
    recipes,
    filter,
    setFilter,
    setRenameTarget,
    setRenameValue,
    setDeleteTarget,
    groupName,
    filtered,
    ungroupedCount,
    createGroup,
    moveRecipe,
  } = vm
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      {/* Группы (фильтр) */}
      <aside className="space-y-1">
        <FilterButton
          active={filter === ALL}
          onClick={() => setFilter(ALL)}
          label="Все рецептуры"
          count={recipes.length}
        />
        <FilterButton
          active={filter === NONE}
          onClick={() => setFilter(NONE)}
          label="Без группы"
          count={ungroupedCount}
        />
        <div className="text-muted-foreground px-2 pt-3 pb-1 text-xs font-medium uppercase">
          Группы
        </div>
        {groups.map((g) => (
          <FilterButton
            key={g.id}
            active={filter === g.id}
            onClick={() => setFilter(g.id)}
            label={g.name}
            count={g.recipe_count}
          />
        ))}
        <CreateGroupDialog onCreate={createGroup} />
      </aside>

      {/* Список рецептур */}
      <div>
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-16 text-center">
              Здесь пока нет рецептур. Откройте{' '}
              <Link href="/calculator" className="text-primary underline">
                калькулятор
              </Link>
              , рассчитайте и нажмите «Сохранить рецептуру».
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((r) => (
              <Card key={r.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {r.name}
                    </CardTitle>
                    <div className="flex shrink-0 flex-wrap items-center gap-1">
                      {r.metrics?.bc == null && (
                        <Badge
                          variant="outline"
                          className="border-amber-400 text-amber-600"
                        >
                          Черновик
                        </Badge>
                      )}
                      {groupName(r.group_id) && (
                        <Badge variant="secondary">
                          {groupName(r.group_id)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {r.metrics?.bc == null
                      ? 'Черновик без расчёта — откройте «Изменить», чтобы досчитать показатели'
                      : 'Эталон-зависимые показатели качества белка'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <Metric label="БЦ, %" value={nf(r.metrics?.bc)} />
                    <Metric label="КРАС, %" value={nf(r.metrics?.kras)} />
                    <Metric label="U" value={nf(r.metrics?.U, 2)} />
                    <Metric label="G" value={nf(r.metrics?.G, 2)} />
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                    <Select
                      value={r.group_id ?? NONE}
                      onValueChange={(v) => moveRecipe(r, v)}
                    >
                      <SelectTrigger className="h-8 w-[150px] text-xs">
                        <FolderInput className="mr-1 h-3.5 w-3.5" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Без группы</SelectItem>
                        {groups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button asChild variant="outline" size="sm" className="h-8">
                      <Link href={`/calculator?edit=${r.id}`}>
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Изменить
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setRenameTarget(r)
                        setRenameValue(r.name)
                      }}
                    >
                      Переименовать
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => setDeleteTarget(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
