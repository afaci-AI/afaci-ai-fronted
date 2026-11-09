'use client'

import { Pencil, Plus, FlaskConical, Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import type { UseProductDetailVm } from '../hooks/useProductDetail'

export function ProductNutrientsCard({ vm }: { vm: UseProductDetailVm }) {
  const {
    nutrients,
    nutrientNames,
    nutrientTypes,
    units,
    canEdit,
    handleOpenDrawer,
    handleDeleteNutrient,
  } = vm
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Нутриенты</CardTitle>
          <CardDescription>Пищевая ценность на 100 г продукта</CardDescription>
        </div>
        {canEdit && (
          <Button onClick={() => handleOpenDrawer()}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {nutrients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <FlaskConical className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Нутриенты не добавлены</p>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => handleOpenDrawer()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить нутриент
              </Button>
            )}
          </div>
        ) : (
          (() => {
            const grouped = nutrientTypes
              .map((type) => ({
                type,
                items: nutrients.filter((n) => {
                  const nm = nutrientNames.find(
                    (x) => x.id === n.nutrient_name_id,
                  )
                  return nm?.nutrient_type_id === type.id
                }),
              }))
              .filter((g) => g.items.length > 0)

            const ungrouped = nutrients.filter((n) => {
              const nm = nutrientNames.find((x) => x.id === n.nutrient_name_id)
              return (
                !nm?.nutrient_type_id ||
                !nutrientTypes.find((t) => t.id === nm.nutrient_type_id)
              )
            })

            return (
              <div className="space-y-6">
                {grouped.map(({ type, items }) => (
                  <div key={type.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {type.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {items.length} позиций
                      </span>
                    </div>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Нутриент</TableHead>
                            <TableHead className="text-right">
                              Количество
                            </TableHead>
                            <TableHead>Единица</TableHead>
                            {canEdit && <TableHead className="w-[80px]" />}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((n) => {
                            const name = nutrientNames.find(
                              (x) => x.id === n.nutrient_name_id,
                            )
                            const unit = units.find((x) => x.id === n.unit_id)
                            return (
                              <TableRow key={n.id}>
                                <TableCell className="font-medium">
                                  {name?.name || '—'}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {n.quantity}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {unit?.name || '—'}
                                  </Badge>
                                </TableCell>
                                {canEdit && (
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleOpenDrawer(n)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteNutrient(n)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}

                {ungrouped.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Без типа
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ungrouped.length} позиций
                      </span>
                    </div>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Нутриент</TableHead>
                            <TableHead className="text-right">
                              Количество
                            </TableHead>
                            <TableHead>Единица</TableHead>
                            {canEdit && <TableHead className="w-[80px]" />}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ungrouped.map((n) => {
                            const name = nutrientNames.find(
                              (x) => x.id === n.nutrient_name_id,
                            )
                            const unit = units.find((x) => x.id === n.unit_id)
                            return (
                              <TableRow key={n.id}>
                                <TableCell className="font-medium">
                                  {name?.name || '—'}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {n.quantity}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {unit?.name || '—'}
                                  </Badge>
                                </TableCell>
                                {canEdit && (
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleOpenDrawer(n)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteNutrient(n)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )
          })()
        )}
      </CardContent>
    </Card>
  )
}
