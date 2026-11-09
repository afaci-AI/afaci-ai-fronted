import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// Границы слоёв (см. docs/architecture-god-files-solid.md и AGENTS.md):
//   app -> modules -> shared;  страницы не ходят в HTTP-клиент напрямую.
const privateModule = '*/modules/*/_*'

function restrict(...extra) {
  return [
    'error',
    {
      patterns: [
        {
          group: [privateModule],
          message:
            'Импорт из приватных папок другого модуля запрещён: используйте index.ts модуля.',
        },
        ...extra,
      ],
    },
  ]
}

const httpClient = {
  group: ['@/lib/api', '@/shared/api/client'],
  message:
    'Страницы не обращаются к HTTP-клиенту: используйте API модуля из @/modules/<name>.',
}
const noApp = {
  group: ['@/app/*', '@/app'],
  message: 'Нижние слои не импортируют app/.',
}
const noModules = {
  group: ['@/modules/*', '@/modules'],
  message: 'shared/ не зависит от модулей.',
}
const noComponents = {
  group: ['@/components/*'],
  message: 'shared/ не зависит от components/.',
}

// Baseline: страницы, которые пока вызывают HTTP-клиент напрямую.
const httpClientBaseline = [
  'app/(dashboard)/dashboard/page.tsx',
  'app/(dashboard)/dictionaries/**/page.tsx',
  'app/(dashboard)/products/**/page.tsx',
  'app/(site)/database/**/page.tsx',
  'app/(site)/ranking/page.tsx',
  'app/(site)/saved-recipes/page.tsx',
]

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
    files: ['modules/**', 'lib/**', 'components/**', 'hooks/**'],
    rules: { 'no-restricted-imports': restrict(noApp) },
  },
  {
    files: ['shared/**'],
    rules: {
      'no-restricted-imports': restrict(noApp, noModules, noComponents),
    },
  },
  { files: httpClientBaseline, rules: { 'no-restricted-imports': restrict() } },
  {
    // Baseline по порогам ниже: файлы, которые уже нарушают их, перечислены
    // отдельными блоками. Список только сокращается; новые файлы добавлять
    // нельзя — разделите файл (этапы 10–11 плана).
    ignores: ['components/ui/**'],
    rules: {
      'max-lines': [
        'error',
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      complexity: ['error', 15],
    },
  },
  {
    files: [
      'app/(dashboard)/app-versions/page.tsx',
      'app/(dashboard)/products/\\[id\\]/page.tsx',
      'app/(dashboard)/users/page.tsx',
      'app/(site)/ranking/page.tsx',
      'components/data-table.tsx',
    ],
    rules: {
      complexity: 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
  {
    files: [
      'app/(dashboard)/dashboard/page.tsx',
      'app/(dashboard)/products/\\[id\\]/edit/page.tsx',
      'app/(dashboard)/products/new/page.tsx',
      'app/(site)/database/page.tsx',
      'components/site-header.tsx',
      'modules/calculator/_components/SaveRecipeDialog.tsx',
      'modules/calculator/_hooks/useCalculator.ts',
    ],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    files: ['app/(site)/calculator/page.tsx'],
    rules: { complexity: 'off', 'max-lines-per-function': 'off' },
  },
  {
    files: [
      'app/(site)/saved-recipes/page.tsx',
      'modules/calculator/_components/Results.tsx',
    ],
    rules: { 'max-lines': 'off', 'max-lines-per-function': 'off' },
  },
])

export default eslintConfig
