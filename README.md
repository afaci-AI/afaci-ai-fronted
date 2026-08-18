# AFACI — Frontend

Next.js-приложение: публичный сайт (калькулятор аминокислотного скора, база продуктов,
ранжирование рецептур) и админ-панель (каталог, словари, управление пользователями).

## Стек

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS + shadcn/ui (Radix UI)

## Установка и запуск

### 1. Предварительные требования

- Node.js 20+
- Запущенный [backend](../afaci/README.md) на `http://localhost:8000`

### 2. Установка зависимостей

```bash
npm install
```

### 3. Переменные окружения

`.env.local`:

```env
NEXT_TELEMETRY_DISABLED=1
# BACKEND_URL=http://localhost:8000   # опционально, см. next.config.mjs (по умолчанию localhost:8000)
```

Запросы к `/api/v1/*` проксируются на backend через rewrite в `next.config.mjs`.

### 4. Запуск

```bash
npm run dev
```

Приложение: http://localhost:3000

## Структура

```
app/
  (site)/          — публичная часть: калькулятор, база продуктов, ранжирование
  (dashboard)/      — админ-панель: продукты, словари, пользователи
  login/            — вход/регистрация
modules/            — фичи, каждая — самостоятельный модуль
  <name>/
    index.ts        — единственная публичная точка входа
    api.ts          — запросы только к своему эндпоинту
    _components/    — приватные компоненты (недоступны другим модулям)
    _hooks/         — приватные хуки
shared/api/         — общий fetch-клиент (client.ts)
lib/                — типы, auth-context, общие утилиты
components/          — переиспользуемые UI-компоненты (shadcn/ui)
```

Импорт из приватных папок (`_components/`, `_hooks/`) чужого модуля запрещён
ESLint-правилом `no-restricted-imports`.

Существующие модули: `auth`, `calculator`, `catalog`, `products`, `saved`, `users`.

## Аутентификация

- JWT-токен хранится в `localStorage` (`afaci_token`), пользователь — в `afaci_user`.
- `lib/auth-context.tsx` — `AuthProvider`/`useAuth()`, восстанавливает сессию через
  `GET /auth/me` при загрузке.
- При ответе `401` на аутентифицированном запросе (`shared/api/client.ts`) фронтенд
  автоматически разлогинивает пользователя — это единый механизм принудительного
  выхода при истечении срока доступа учётной записи (проверяется на бэкенде на
  каждом запросе).
- Права проверяются через `hasPermission(role, permission)` (`lib/types.ts`).

### Тестовый администратор

Совпадает с учётными данными в [backend README](../afaci/README.md#тестовый-администратор-локальная-бд-разработки).
**Только для локальной разработки**, не использовать на проде без смены пароля.

Раздел управления пользователями: `/users` (доступен ролям с правом `canManageUsers`).

## Полезные команды

```bash
npm run dev      # dev-сервер с HMR
npm run build    # прод-сборка
npm run start    # запуск прод-сборки
npm run lint     # ESLint
```
