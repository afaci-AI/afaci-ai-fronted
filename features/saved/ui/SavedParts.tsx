import { useState } from 'react'
import { FolderPlus, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'

export function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors',
        active
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
      )}
    >
      <span className="truncate">{label}</span>
      <span className="text-muted-foreground ml-2 text-xs">{count}</span>
    </button>
  )
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-md py-1.5">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-muted-foreground text-[10px]">{label}</div>
    </div>
  )
}

export function CreateGroupDialog({
  onCreate,
}: {
  onCreate: (name: string) => Promise<void>
}) {
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
    } catch (e) {
      toast.error('Не удалось создать группу', {
        description: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground mt-1 w-full justify-start"
        >
          <FolderPlus className="mr-1.5 h-4 w-4" /> Новая группа
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая группа</DialogTitle>
          <DialogDescription>
            Группы помогают организовать рецептуры, как плейлисты.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="group-name">Название группы</Label>
          <Input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Напр.: Мясные рецептуры"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Создание…
              </>
            ) : (
              'Создать'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
