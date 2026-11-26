export const baseNavItems = [
  { label: 'Главная', href: '/' },
  { label: 'База данных', href: '/database' },
  { label: 'Калькулятор', href: '/calculator' },
  { label: 'Источники', href: '/sources' },
  { label: 'О нас', href: '/about' },
]

// Доступны только авторизованным пользователям.
export const authNavItems = [
  { label: 'Мои рецептуры', href: '/saved-recipes' },
  { label: 'Ранжирование', href: '/ranking' },
]

export function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function apkDownloadName(version: string | null): string {
  const clean = (version ?? '').replace(/[^A-Za-z0-9._-]/g, '_')
  return clean ? `foodcraftsl-release-${clean}.apk` : 'foodcraftsl-release.apk'
}
