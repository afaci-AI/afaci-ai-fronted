// TEMP: reports-temp
import { FileText } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'

export function ReportsTempHeader() {
  return (
    <div className="mb-6">
      <h1 className="flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight">
        <FileText className="h-7 w-7 text-primary" />
        Отчёты по сырью
        <Badge variant="outline">временно</Badge>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Выборка сырья из базы по критериям и пищевая ценность сохранённой
        рецептуры в формате PDF. Раздел учебный, на ветке education.
      </p>
    </div>
  )
}
