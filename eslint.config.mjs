import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// Границы слоёв (см. docs/AGENTS.md): app -> features -> shared.
// Фича открывает наружу только index.ts; страницы не ходят в HTTP-клиент.
function restrict(...extra) {
  return [
    'error',
    {
      patterns: [
        {
          group: ['@/features/*/*'],
          message:
            'Импортируйте фичу целиком (@/features/<имя>): внутренности фичи закрыты.',
        },
        ...extra,
      ],
    },
  ]
}

const httpClient = {
  group: ['@/shared/api/client'],
  message:
    'Страницы не обращаются к HTTP-клиенту: используйте API фичи из @/features/<имя>.',
}
const noApp = {
  group: ['@/app/*', '@/app'],
  message: 'Нижние слои не импортируют app/.',
}
const noFeatures = {
  group: ['@/features/*', '@/features'],
  message: 'shared/ не зависит от фич.',
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  { rules: { 'no-restricted-imports': restrict() } },
  {
    files: ['app/**'],
    rules: { 'no-restricted-imports': restrict(httpClient) },
  },
  {
    files: ['features/**'],
    rules: { 'no-restricted-imports': restrict(noApp) },
  },
  {
    files: ['shared/**'],
    rules: { 'no-restricted-imports': restrict(noApp, noFeatures) },
  },
  {
    // Размер и сложность. shadcn-примитивы (shared/ui) исключены. Файлы, уже
    // нарушающие пороги, перечислены в baseline ниже; список только сокращается.
    ignores: ['shared/ui/**'],
    rules: {
      'max-lines': [
        'error',
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 250, skipBlankLines: true, skipComments: true },
      ],
      complexity: ['error', 15],
    },
  },
])

export default eslintConfig
