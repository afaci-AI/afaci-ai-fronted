'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { FieldGroup, Field, FieldLabel, FieldMessage } from '@/shared/ui/field'
import { authApi, useAuth } from '@/features/auth'

function validate(current: string, password: string, repeat: string) {
  if (!current) return 'Укажите текущий пароль из письма.'
  if (password.length < 6)
    return 'Новый пароль должен быть не короче 6 символов.'
  if (password === current) return 'Новый пароль должен отличаться от текущего.'
  if (password !== repeat) return 'Пароли не совпадают.'
  return null
}

/** Смена пароля; при первом входе с временным паролем — обязательная. */
export default function ChangePasswordPage() {
  const { user, isLoading, logout, markPasswordChanged } = useAuth()
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const required = Boolean(user?.mustChangePassword)

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login?next=/change-password')
  }, [isLoading, user, router])

  const submit = async () => {
    const invalid = validate(current, password, repeat)
    setError(invalid ?? '')
    if (invalid) return
    setSaving(true)
    try {
      await authApi.changePassword({
        current_password: current,
        new_password: password,
      })
      markPasswordChanged()
      router.replace('/calculator')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось сменить пароль.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">
            {required ? 'Задайте свой пароль' : 'Смена пароля'}
          </CardTitle>
          <CardDescription>
            {required
              ? 'Вы вошли с временным паролем из письма. Чтобы продолжить, придумайте собственный.'
              : 'Введите текущий пароль и новый'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
            className="space-y-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="current-password">
                  {required ? 'Временный пароль из письма' : 'Текущий пароль'}
                </FieldLabel>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                  autoFocus
                  disabled={saving}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-password">Новый пароль</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Не короче 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={saving}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="repeat-password">
                  Повторите пароль
                </FieldLabel>
                <Input
                  id="repeat-password"
                  type="password"
                  autoComplete="new-password"
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  required
                  disabled={saving}
                />
              </Field>
            </FieldGroup>
            {error && <FieldMessage variant="error">{error}</FieldMessage>}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить пароль'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground hover:underline"
              onClick={() => {
                logout()
                router.replace('/login')
              }}
            >
              Выйти
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
