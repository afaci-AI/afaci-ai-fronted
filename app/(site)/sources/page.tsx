'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, BookOpen } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Spinner } from '@/shared/ui/spinner'
import { SourceLink, normsApi } from '@/features/norms'
import type { Source } from '@/features/norms'

const KIND_LABELS: Record<string, string> = {
  article: 'Статья',
  document: 'Документ',
  book: 'Книга',
  link: 'Ссылка',
  file: 'Файл',
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setSources(await normsApi.sources())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookOpen className="h-6 w-6 text-primary" />
          Источники
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Документы, статьи и ссылки, на которые опирается программа: эталоны
          ФАО/ВОЗ, суточные нормы и другие материалы.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Spinner className="mr-2" /> Загрузка источников...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium text-foreground">
            Не удалось загрузить источники
          </p>
          <p className="text-sm">{error}</p>
        </div>
      ) : sources.length === 0 ? (
        <p className="text-muted-foreground">Источники пока не добавлены.</p>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {KIND_LABELS[source.kind] ?? source.kind}
                  </Badge>
                  {source.year ? (
                    <span className="text-muted-foreground text-sm">
                      {source.year}
                    </span>
                  ) : null}
                </div>
                <CardTitle className="text-base leading-snug">
                  <SourceLink source={source} />
                </CardTitle>
                {source.authors ? (
                  <CardDescription>{source.authors}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {source.used_for ? (
                  <p>
                    <span className="text-muted-foreground">
                      Где применяется:{' '}
                    </span>
                    {source.used_for}
                  </p>
                ) : null}
                {source.location ? (
                  <p>
                    <span className="text-muted-foreground">Место: </span>
                    {source.location}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
