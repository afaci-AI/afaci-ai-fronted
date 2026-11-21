export function nf(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('ru-RU', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
}
