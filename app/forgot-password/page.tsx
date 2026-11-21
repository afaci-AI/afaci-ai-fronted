'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { KeyRound, MailCheck, ShieldCheck, CircleCheck } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { authApi } from '@/features/auth'
import { CodeStep, EmailStep, PasswordStep } from './_parts/steps'

type Step = 'email' | 'code' | 'password' | 'done'

const SCREENS: Record<
  Step,
  { title: string; description: string; icon: typeof KeyRound }
> = {
  email: {
    title: 'Восстановление пароля',
    description: 'Укажите email аккаунта — пришлём код подтверждения',
    icon: KeyRound,
  },
  code: {
    title: 'Введите код',
    description: 'Шесть цифр из письма',
    icon: MailCheck,
  },
  password: {
    title: 'Новый пароль',
    description: 'Код подтверждён. Придумайте новый пароль',
    icon: ShieldCheck,
  },
  done: {
    title: 'Пароль изменён',
    description: 'Войдите с новым паролем',
    icon: CircleCheck,
  },
}

function errorText(err: unknown) {
  return err instanceof Error
    ? err.message
    : 'Произошла ошибка. Попробуйте позже.'
}

/** Восстановление пароля: email → код по ячейкам → новый пароль. */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendAt, setResendAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000))

  useEffect(() => {
    if (resendAt <= Date.now()) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [resendAt])

  const run = async (action: () => Promise<void>) => {
    setError('')
    setIsLoading(true)
    try {
      await action()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setIsLoading(false)
    }
  }

  const sendCode = () =>
    run(async () => {
      const res = await authApi.requestPasswordReset(email.trim())
      setNotice(res.message)
      setResendAt(Date.now() + (res.resend_after ?? 60) * 1000)
      setNow(Date.now())
      setCode('')
      setStep('code')
    })

  const verify = (value: string) =>
    run(async () => {
      try {
        await authApi.verifyPasswordReset({ email: email.trim(), code: value })
        setStep('password')
      } catch (err) {
        setCode('')
        throw err
      }
    })

  const save = (password: string, repeat: string) => {
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов.')
      return
    }
    if (password !== repeat) {
      setError('Пароли не совпадают.')
      return
    }
    void run(async () => {
      await authApi.confirmPasswordReset({
        email: email.trim(),
        code,
        new_password: password,
      })
      setStep('done')
    })
  }

  const screen = SCREENS[step]

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <screen.icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">{screen.title}</CardTitle>
          <CardDescription>{screen.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <EmailStep
              email={email}
              onEmailChange={setEmail}
              onSubmit={() => void sendCode()}
              error={error}
              isLoading={isLoading}
            />
          )}
          {step === 'code' && (
            <CodeStep
              email={email.trim()}
              notice={notice}
              code={code}
              onCodeChange={(value) => {
                setCode(value)
                setError('')
              }}
              onComplete={(value) => void verify(value)}
              onResend={() => void sendCode()}
              resendIn={resendIn}
              onChangeEmail={() => {
                setStep('email')
                setError('')
                setCode('')
              }}
              error={error}
              isLoading={isLoading}
            />
          )}
          {step === 'password' && (
            <PasswordStep onSubmit={save} error={error} isLoading={isLoading} />
          )}
          {step === 'done' && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                На других устройствах потребуется войти заново.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Перейти ко входу</Link>
              </Button>
            </div>
          )}
          {step !== 'done' && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="hover:text-foreground hover:underline"
              >
                Вернуться ко входу
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
