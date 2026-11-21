'use client'

import {
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Spinner } from '@/shared/ui/spinner'
import { toDate } from '../model/version-form'
import type { UseAppVersionsAdminVm } from '../hooks/useAppVersionsAdmin'

export function AppVersionsList({ vm }: { vm: UseAppVersionsAdminVm }) {
  const {
    versions,
    isLoading,
    handleOpenEdit,
    handleSetCurrent,
    handleDelete,
  } = vm
  return (
    <Card>
      <CardHeader>
        <CardTitle>Загруженные версии</CardTitle>
        <CardDescription>
          Список всех версий приложения и их статус
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Версия</TableHead>
                <TableHead>Version code</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Обязательное</TableHead>
                <TableHead>Изменения</TableHead>
                <TableHead>Опубликована</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : versions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Версии не загружены
                  </TableCell>
                </TableRow>
              ) : (
                versions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {v.version}
                        {v.isCurrent && (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.versionCode}
                    </TableCell>
                    <TableCell>
                      {v.isCurrent ? (
                        <Badge>Текущая</Badge>
                      ) : (
                        <Badge variant="outline">Архивная</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {v.forceUpdate ? (
                        <Badge variant="destructive">Да</Badge>
                      ) : (
                        <span className="text-muted-foreground">Нет</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {v.changelog || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {toDate(v.publishedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!v.isCurrent && (
                            <DropdownMenuItem
                              onClick={() => handleSetCurrent(v)}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Сделать текущей
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <a
                              href={v.apkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Открыть файл
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(v)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(v)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
