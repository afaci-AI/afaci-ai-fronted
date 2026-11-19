'use client'

// TEMP: reports-temp
import { Download, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { kindHints, kindTitles, type ReportKind } from '../model/report-form'
import type { UseReportsTempVm } from '../hooks/useReportsTemp'
import { CardFields, ListFields, RankingFields } from './CriteriaFields'

const KINDS: ReportKind[] = ['list', 'ranking', 'card']

export function ReportBuilderCard({ vm }: { vm: UseReportsTempVm }) {
  const { kind, setKind, busy, run } = vm
  return (
    <Card>
      <CardHeader>
        <Tabs value={kind} onValueChange={(v) => setKind(v as ReportKind)}>
          <TabsList className="flex h-auto flex-wrap">
            {KINDS.map((k) => (
              <TabsTrigger key={k} value={k}>
                {kindTitles[k]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <CardTitle className="pt-2 text-base font-medium text-muted-foreground">
          {kindHints[kind]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {kind === 'list' && <ListFields vm={vm} />}
        {kind === 'ranking' && <RankingFields vm={vm} />}
        {kind === 'card' && <CardFields vm={vm} />}
        <div className="flex flex-wrap gap-3">
          <Button disabled={busy} onClick={() => run('download')}>
            {busy ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-4 w-4" />
            )}
            Скачать PDF
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => run('open')}>
            <ExternalLink className="mr-1.5 h-4 w-4" /> Открыть для печати
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
