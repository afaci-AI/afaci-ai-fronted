'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/shared/ui/input-otp'
import { FieldGroup, Field, FieldLabel, FieldMessage } from '@/shared/ui/field'

export const CODE_LENGTH = 6

function formatSeconds(total: number) {
  const m = Math.floor(total / 60)
  const sec = String(total % 60).padStart(2, '0')
  return `${m}:${sec}`
}

export function EmailStep({
  email,
  onEmailChange,
  onSubmit,
  error,
  isLoading,
}: {
  email: string
  onEmailChange: (value: string) => void
  onSubmit: () => void
  error: string
  isLoading: boolean
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          autoFocus
          disabled={isLoading}
        />
      </Field>
      {error && <FieldMessage variant="error">{error}</FieldMessage>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Отправка...' : 'Получить код'}
      </Button>
    </form>
  )
}

/** Шесть ячеек: цифры вводятся подряд, фокус сам переходит к следующей. */
export function CodeStep({
  email,
  notice,
  code,
  onCodeChange,
  onComplete,
  onResend,
  resendIn,
  onChangeEmail,
  error,
  isLoading,
}: {
  email: string
  notice: string
  code: string
  onCodeChange: (value: string) => void
  onComplete: (value: string) => void
  onResend: () => void
  /** Секунд до разрешения повторной отправки; 0 — можно отправлять. */
  resendIn: number
  onChangeEmail: () => void
  error: string
  isLoading: boolean
}) {
  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-muted-foreground">
        {notice}
        <br />
        <span className="font-medium text-foreground">{email}</span>
      </p>
      <div className="flex justify-center">
        <InputOTP
          maxLength={CODE_LENGTH}
          pattern="^[0-9]+$"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={code}
          onChange={(value) => {
            // Не disabled: иначе поле теряет фокус после неверного кода.
            if (!isLoading) onCodeChange(value)
          }}
          onComplete={onComplete}
          aria-label="Код из письма"
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: CODE_LENGTH }, (_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                aria-invalid={Boolean(error)}
                className="h-12 w-11 rounded-md border text-lg font-semibold first:rounded-l-md last:rounded-r-md"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && (
        <FieldMessage variant="error" className="text-center">
          {error}
        </FieldMessage>
      )}
      <Button
        type="button"
        className="w-full"
        disabled={isLoading || code.length !== CODE_LENGTH}
        onClick={() => onComplete(code)}
      >
        {isLoading ? 'Проверка...' : 'Подтвердить'}
      </Button>
      <div className="flex justify-between text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
          onClick={onResend}
          disabled={isLoading || resendIn > 0}
        >
          {resendIn > 0
            ? `Отправить ещё раз через ${formatSeconds(resendIn)}`
            : 'Отправить код ещё раз'}
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground hover:underline"
          onClick={onChangeEmail}
          disabled={isLoading}
        >
          Изменить email
        </button>
      </div>
    </div>
  )
}

export function PasswordStep({
  onSubmit,
  error,
  isLoading,
}: {
  onSubmit: (password: string, repeat: string) => void
  error: string
  isLoading: boolean
}) {
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(password, repeat)
      }}
      className="space-y-4"
    >
      <FieldGroup>
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
            autoFocus
            disabled={isLoading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="repeat-password">Повторите пароль</FieldLabel>
          <Input
            id="repeat-password"
            type="password"
            autoComplete="new-password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            required
            disabled={isLoading}
          />
        </Field>
      </FieldGroup>
      {error && <FieldMessage variant="error">{error}</FieldMessage>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
      </Button>
    </form>
  )
}
