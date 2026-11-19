# TEMP: reports-temp — как удалить фичу

Временная фича PDF-отчётов по выборке сырья (web). Удаляется целиком (общий этап 15 плана).

1. Удалить папку `features/reports-temp/`.
2. Удалить страницу `app/(site)/reports-temp/`.
3. В `features/navigation/model/site-nav.ts` убрать пункт со строкой `TEMP: reports-temp`.
4. В `eslint.config.mjs` убрать `noReportsTemp` и блок `features/reports-temp/**`
   (помечены `TEMP`), вернув `restrict(noApp)` и `restrict(noApp, noFeatures)`.
5. Убрать раздел о временной фиче в `docs/frontend/README.md`.
6. Проверить: `grep -ri "reports-temp\|TEMP: reports" . --exclude-dir=node_modules --exclude-dir=.next`
   ничего не находит; `npx eslint .`, `npx prettier --check .`, `npx tsc --noEmit`, сборка проходят.
