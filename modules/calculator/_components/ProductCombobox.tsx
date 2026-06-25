'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ProductCombobox({
  value, onChange, products,
}: {
  value: string
  onChange: (id: string) => void
  products: any[]
}) {
  const [open, setOpen] = useState(false)
  const selected = products.find((p) => p.product_id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="truncate">
              {selected.product_name}
              <span className="text-muted-foreground ml-1.5 text-xs">
                · {selected.region_name}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Выберите сырьё…</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(val, search) => (val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
        >
          <CommandInput placeholder="Поиск сырья…" />
          <CommandList>
            <CommandEmpty>Ничего не найдено.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.product_id}
                  value={`${p.product_name} ${p.region_name} ${p.subcategory_name ?? ''} ${p.product_id}`}
                  onSelect={() => { onChange(p.product_id); setOpen(false) }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === p.product_id ? 'opacity-100' : 'opacity-0')}
                  />
                  <div className="flex flex-col">
                    <span>{p.product_name}</span>
                    <span className="text-muted-foreground text-xs">
                      {p.region_name}{p.subcategory_name ? ` · ${p.subcategory_name}` : ''}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
