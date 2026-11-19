'use client'

// TEMP: reports-temp — временная страница, удаляется вместе с фичей.
import { Loader2 } from 'lucide-react'
import {
  useReportsTemp,
  ReportsTempHeader,
  ReportBuilderCard,
} from '@/features/reports-temp'

export default function ReportsTempPage() {
  const vm = useReportsTemp()

  if (vm.authLoading || !vm.isAuthenticated) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-32 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Проверка доступа…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <ReportsTempHeader />
      <ReportBuilderCard vm={vm} />
    </div>
  )
}
