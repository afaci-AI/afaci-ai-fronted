'use client'

import { Info, Scale } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DailyNorms } from '../api'
import { SourceLink } from './SourceLink'

/** Информационная кнопка: на что опираются нормы и почему норма одна, усреднённая. */
export function NormsInfoButton({ data }: { data: DailyNorms }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Info className="h-4 w-4" /> Откуда эти нормы?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            {data.info.title}
          </DialogTitle>
          <DialogDescription>
            На какие документы опираются значения и как получена норма
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {data.info.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Как получена каждая норма
            </p>
            <ul className="space-y-2">
              {data.norms.map((row) => (
                <li key={row.key}>
                  <span className="font-medium">{row.name}</span>
                  {row.basis ? (
                    <span className="text-muted-foreground">
                      {' '}
                      — {row.basis}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          {data.sources.length > 0 ? (
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                Источники
              </p>
              <ul className="space-y-1">
                {data.sources.map((source) => (
                  <li key={source.id}>
                    <SourceLink source={source} />
                    {source.year ? (
                      <span className="text-muted-foreground">
                        {' '}
                        ({source.year})
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
            {data.info.disclaimer}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
