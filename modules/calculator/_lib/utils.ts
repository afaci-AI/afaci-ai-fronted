export function nf(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('ru-RU', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
}

export const COL = {
  protein: 'var(--chart-1)',
  fat: 'var(--chart-4)',
  carb: 'var(--chart-2)',
  fiber: 'var(--chart-5)',
  score: 'var(--chart-1)',
  min: 'var(--destructive)',
  good: 'var(--success)',
  kras: 'var(--destructive)',
  bc: 'var(--success)',
}
