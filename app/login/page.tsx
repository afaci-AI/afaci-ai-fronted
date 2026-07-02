'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Database, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldMessage } from '@/components/ui/field'
import { useAuth } from '@/lib/auth-context'

function LoginInner() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/calculator'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, name, password)
      }
      router.push(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'login' ? 'Вход в AFACI' : 'Регистрация'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Войдите, чтобы пользоваться калькулятором и сохранять рецептуры'
              : 'Создайте аккаунт для доступа к калькулятору и сохранённым рецептурам'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              {mode === 'register' && (
                <Field>
                  <FieldLabel htmlFor="name">Имя</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Как к вам обращаться"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Пароль</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'register' ? 'Минимум 6 символов' : 'Введите пароль'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </Field>
            </FieldGroup>

            {error && <FieldMessage variant="error">{error}</FieldMessage>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? (mode === 'login' ? 'Вход...' : 'Регистрация...')
                : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-1"
                  onClick={() => { setMode('register'); setError('') }}
                >
                  Зарегистрироваться
                </Button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-1"
                  onClick={() => { setMode('login'); setError('') }}
                >
                  Войти
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
