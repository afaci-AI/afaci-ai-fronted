'use client'

import { Info, FlaskConical } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { nf } from '../_lib/utils'

export function ReferenceInfoButton({ reference }: { reference: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Info className="h-4 w-4" /> Почему этот эталон?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Эталонный белок «{reference.name}»
          </DialogTitle>
          <DialogDescription>Почему он выбран как эталон и что это значит</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>{reference.description}</p>
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-muted-foreground mb-1 text-xs">
              Аминокислотный скор показывает, насколько белок продукта приближается к эталону:
            </p>
            <p className="font-medium">Скор C = (НАК продукта ÷ НАК эталона) × 100&nbsp;%</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Эталон — «идеальный» белок с оптимально сбалансированным составом незаменимых
              аминокислот (НАК). Минимальный скор задаёт лимитирующую кислоту и биологическую ценность.
            </p>
          </div>
          <div>
            <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Таблица 4 — профиль эталона, г/100 г белка
            </div>
            <div className="grid grid-cols-4 gap-2">
              {reference.values.map((v: any) => (
                <div key={v.amino_acid} className="rounded-md border p-2 text-center">
                  <div className="text-muted-foreground text-[11px]">{v.amino_acid}</div>
                  <div className="font-semibold">{nf(v.value, 1)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
