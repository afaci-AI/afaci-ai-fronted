'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bookmark, FolderPlus, Loader2, Pencil, Trash2, FolderInput, Sparkles, Calculator,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { DeleteDialog } from '@/components/delete-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { savedApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const ALL = '__all__'
const NONE = '__none__'

function nf(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export default function SavedRecipesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [groups, setGroups] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>(ALL)

  const [renameTarget, setRenameTarget] = useState<any | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login?next=/saved-recipes')
  }, [authLoading, isAuthenticated, router])

  const load = useCallback(async () => {
    try {
      const [gs, rs] = await Promise.all([savedApi.groups(), savedApi.recipes()])
      setGroups(gs)
      setRecipes(rs)
    } catch (e: any) {
      toast.error('Не удалось загрузить рецептуры', { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  const groupName = useCallback(
    (id: string | null) => groups.find((g) => g.id === id)?.name ?? null,
    [groups],
  )

  const filtered = useMemo(() => {
    if (filter === ALL) return recipes
    if (filter === NONE) return recipes.filter((r) => !r.group_id)
    return recipes.filter((r) => r.group_id === filter)
  }, [recipes, filter])

  const ungroupedCount = recipes.filter((r) => !r.group_id).length

  const createGroup = async (name: string) => {
    await savedApi.createGroup({ name })
    await load()
  }

  const moveRecipe = async (recipe: any, groupId: string) => {
    try {
      await savedApi.updateRecipe(recipe.id, { group_id: groupId === NONE ? null : groupId })
      toast.success('Рецептура перемещена')
      await load()
    } catch (e: any) {
      toast.error('Не удалось переместить', { description: e.message })
    }
  }

  const doRename = async () => {
    if (!renameTarget || !renameValue.trim()) return
    try {
      await savedApi.updateRecipe(renameTarget.id, { name: renameValue.trim() })
      toast.success('Переименовано')
      setRenameTarget(null)
      await load()
    } catch (e: any) {
      toast.error('Не удалось переименовать', { description: e.message })
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-32 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Проверка доступа…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Bookmark className="h-7 w-7 text-primary" />
            Сохранённые рецептуры
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ваши рецептуры и группы. Перемещайте между группами, редактируйте и удаляйте.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/optimization"><Sparkles className="mr-1.5 h-4 w-4" /> Оптимизация</Link>
          </Button>
          <Button asChild>
            <Link href="/calculator"><Calculator className="mr-1.5 h-4 w-4" /> В калькулятор</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-20 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Загрузка…
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Группы (фильтр) */}
          <aside className="space-y-1">
            <FilterButton active={filter === ALL} onClick={() => setFilter(ALL)}
              label="Все рецептуры" count={recipes.length} />
            <FilterButton active={filter === NONE} onClick={() => setFilter(NONE)}
              label="Без группы" count={ungroupedCount} />
            <div className="text-muted-foreground px-2 pt-3 pb-1 text-xs font-medium uppercase">
              Группы
            </div>
            {groups.map((g) => (
              <FilterButton key={g.id} active={filter === g.id} onClick={() => setFilter(g.id)}
                label={g.name} count={g.recipe_count} />
            ))}
            <CreateGroupDialog onCreate={createGroup} />
          </aside>

          {/* Список рецептур */}
          <div>
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground py-16 text-center">
                  Здесь пока нет рецептур. Откройте{' '}
                  <Link href="/calculator" className="text-primary underline">калькулятор</Link>,
                  рассчитайте и нажмите «Сохранить рецептуру».
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((r) => (
                  <Card key={r.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight">{r.name}</CardTitle>
                        <div className="flex shrink-0 flex-wrap items-center gap-1">
                          {r.metrics?.bc == null && (
                            <Badge variant="outline" className="border-amber-400 text-amber-600">Черновик</Badge>
                          )}
                          {groupName(r.group_id) && (
                            <Badge variant="secondary">{groupName(r.group_id)}</Badge>
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
                        <Metric label="V" value={nf(r.metrics?.V, 2)} />
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
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button asChild variant="outline" size="sm" className="h-8">
                          <Link href={`/calculator?edit=${r.id}`}>
                            <Pencil className="mr-1 h-3.5 w-3.5" /> Изменить
                          </Link>
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="h-8"
                          onClick={() => { setRenameTarget(r); setRenameValue(r.name) }}
                        >
                          Переименовать
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="text-destructive h-8 w-8"
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
      )}

      {/* Переименование */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать рецептуру</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="rename">Название</Label>
            <Input id="rename" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Отмена</Button>
            <Button onClick={doRename}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Удаление */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Удалить «${deleteTarget?.name ?? ''}»?`}
        onConfirm={async () => {
          if (!deleteTarget) return
          await savedApi.deleteRecipe(deleteTarget.id)
          setDeleteTarget(null)
          await load()
        }}
      />
    </div>
  )
}

function FilterButton({ active, onClick, label, count }: {
  active: boolean; onClick: () => void; label: string; count: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors',
        active ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
      )}
    >
      <span className="truncate">{label}</span>
      <span className="text-muted-foreground ml-2 text-xs">{count}</span>
    </button>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-md py-1.5">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-muted-foreground text-[10px]">{label}</div>
    </div>
  )
}

function CreateGroupDialog({ onCreate }: { onCreate: (name: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onCreate(name.trim())
      toast.success('Группа создана')
      setName('')
      setOpen(false)
    } catch (e: any) {
      toast.error('Не удалось создать группу', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground mt-1 w-full justify-start">
          <FolderPlus className="mr-1.5 h-4 w-4" /> Новая группа
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая группа</DialogTitle>
          <DialogDescription>Группы помогают организовать рецептуры, как плейлисты.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="group-name">Название группы</Label>
          <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Напр.: Мясные рецептуры" autoFocus />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Отмена</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Создание…</> : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
