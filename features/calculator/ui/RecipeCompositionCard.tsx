'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/shared/ui/table'
import { nf } from '../model/utils'
import type { UseResultsViewVm } from '../hooks/useResultsView'

export function RecipeCompositionCard({ vm }: { vm: UseResultsViewVm }) {
  const { result } = vm
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Таблица 1 — Рецептура</CardTitle>
        <CardDescription>Состав образца на 100 г</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Сырьё</TableHead>
              <TableHead>Область</TableHead>
              <TableHead>Подкатегория</TableHead>
              <TableHead className="text-right">Xᵢ, г</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.recipe.map((it, i: number) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{it.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {it.region ?? '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {it.subcategory ?? '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {nf(it.amount_g, 2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-semibold">
                Σ
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {nf(result.sum_g, 1)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
