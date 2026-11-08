import { ExternalLink, FileText } from 'lucide-react'
import type { Source } from '../api'

/** Ссылка на источник: файл документа, если он приложен, иначе внешняя ссылка. */
export function SourceLink({
  source,
  children,
}: {
  source: Source
  children?: React.ReactNode
}) {
  const href = source.pdf_url || source.url
  const label = children ?? source.title
  if (!href) return <span>{label}</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-1 text-primary underline-offset-4 hover:underline"
    >
      <span>{label}</span>
      {source.pdf_url ? (
        <FileText className="h-3.5 w-3.5 shrink-0 self-center" />
      ) : (
        <ExternalLink className="h-3.5 w-3.5 shrink-0 self-center" />
      )}
    </a>
  )
}
