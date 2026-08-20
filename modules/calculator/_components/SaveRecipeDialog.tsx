'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookmarkPlus, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { savedApi } from '@/modules/saved/api'
import type {
  SavedGroup,
  SaveRecipeBody,
  UpdateRecipeBody,
} from '@/modules/saved/api'

const NO_GROUP = '__none__'
const NEW_GROUP = '__new__'

export function SaveRecipeDialog({
  referenceProteinId,
  items,
  editing,
  computable = true,
}: {
  referenceProteinId: string
  items: {
    product_id: string
    amount_g: number
    price_per_kg?: number | null
  }[]
  editing?: { id: string; name: string; group_id: string | null } | null
  computable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<SavedGroup[]>([])
  const [name, setName] = useState('')
  const [groupChoice, setGroupChoice] = useState<string>(NO_GROUP)
  const [newGroupName, setNewGroupName] = useState('')
  const [saving, setSaving] = useState(false)
  const isEdit = !!editing
  const isDraft = !computable

  useEffect(() => {
    if (!open) return
    savedApi
      .groups()
      .then(setGroups)
      .catch(() => setGroups([]))
  }, [open])

  // Заполнение формы при открытии на редактирование: синхронное обновление состояния во время рендера.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && editing) {
      setName(editing.name)
      setGroupChoice(editing.group_id ?? NO_GROUP)
    }
  }

  const persist = async (asNew: boolean) => {
    if (!name.trim()) {
      toast.error('Укажите название рецептуры')
      return
    }
    if (groupChoice === NEW_GROUP && !newGroupName.trim()) {
      toast.error('Введите название новой группы')
      return
    }
    setSaving(true)
    try {
      if (isEdit && !asNew) {
        const body: UpdateRecipeBody = {
          name: name.trim(),
          reference_protein_id: referenceProteinId,
          items,
          draft: isDraft,
          group_id:
            groupChoice === NO_GROUP || groupChoice === NEW_GROUP
              ? null
              : groupChoice,
        }
        if (groupChoice === NEW_GROUP) {
          const g = await savedApi.createGroup({ name: newGroupName.trim() })
          body.group_id = g.id
        }
        await savedApi.updateRecipe(editing!.id, body)
        toast.success(
          isDraft
            ? `Черновик «${name.trim()}» обновлён`
            : `Рецептура «${name.trim()}» обновлена`,
        )
      } else {
        const body: SaveRecipeBody = {
          name: name.trim(),
          reference_protein_id: referenceProteinId,
          items,
          draft: isDraft,
        }
        if (groupChoice === NEW_GROUP) body.new_group_name = newGroupName.trim()
        else if (groupChoice !== NO_GROUP) body.group_id = groupChoice
        await savedApi.createRecipe(body)
        toast.success(
          isDraft
            ? `Черновик «${name.trim()}» сохранён`
            : `Рецептура «${name.trim()}» сохранена`,
        )
      }
      setOpen(false)
      setNewGroupName('')
    } catch (e) {
      toast.error('Не удалось сохранить', {
        description: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isDraft ? 'outline' : 'default'} className="gap-1.5">
          <BookmarkPlus className="h-4 w-4" />{' '}
          {isEdit ? 'Обновить рецептуру' : 'Сохранить рецептуру'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Обновить рецептуру' : 'Сохранить рецептуру'}
          </DialogTitle>
          <DialogDescription>
            Дайте рецептуре название и при желании поместите её в группу (как
            плейлист).
          </DialogDescription>
        </DialogHeader>
        {isDraft && (
          <div className="text-muted-foreground bg-muted/50 flex items-start gap-2 rounded-md p-2.5 text-xs">
            <AlertTriangle className="text-amber-500 mt-0.5 h-4 w-4 shrink-0" />
            Расчёт не выполнен (сумма ≠ 100 г или заполнены не все поля).
            Рецептура сохранится как
            <span className="font-medium">&nbsp;черновик</span> — без
            показателей качества. Их можно досчитать позже, открыв черновик в
            калькуляторе.
          </div>
        )}
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="recipe-name">Название</Label>
            <Input
              id="recipe-name"
              placeholder="Напр.: Котлеты Московские (опыт 1)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <p className="text-muted-foreground text-xs">
              Название может повторяться.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Группа</Label>
            <Select value={groupChoice} onValueChange={setGroupChoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_GROUP}>Без группы</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_GROUP}>+ Новая группа…</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {groupChoice === NEW_GROUP && (
            <div className="space-y-1.5">
              <Label htmlFor="new-group">Название новой группы</Label>
              <Input
                id="new-group"
                placeholder="Напр.: Мясные рецептуры"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Отмена
          </Button>
          {isEdit && (
            <Button
              variant="secondary"
              onClick={() => persist(true)}
              disabled={saving}
            >
              Сохранить как новую
            </Button>
          )}
          <Button onClick={() => persist(false)} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение…
              </>
            ) : isDraft ? (
              'Сохранить черновик'
            ) : isEdit ? (
              'Обновить'
            ) : (
              'Сохранить'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
