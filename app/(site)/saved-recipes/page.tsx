'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { savedApi } from '@/features/saved'
import {
  useSavedRecipes,
  SavedRecipesHeader,
  SavedRecipesGrid,
} from '@/features/saved'

export default function SavedRecipesPage() {
  const vm = useSavedRecipes()
  const {
    loading,
    renameTarget,
    setRenameTarget,
    renameValue,
    setRenameValue,
    deleteTarget,
    setDeleteTarget,
    isAuthenticated,
    authLoading,
    load,
    doRename,
  } = vm

  if (authLoading || !isAuthenticated) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-32 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Проверка доступа…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SavedRecipesHeader />

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-20 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Загрузка…
        </div>
      ) : (
        <SavedRecipesGrid vm={vm} />
      )}

      {/* Переименование */}
      <Dialog
        open={!!renameTarget}
        onOpenChange={(o) => !o && setRenameTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать рецептуру</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="rename">Название</Label>
            <Input
              id="rename"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Отмена
            </Button>
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
