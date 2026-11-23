'use client'

import { useCallback, useEffect, useState } from 'react'

import type { DictionaryEntity, DictionarySpec } from '../model/dictionary-spec'

export interface UseDictionaryVm<T extends DictionaryEntity, R extends object> {
  items: T[]
  related: R
  loading: boolean
  error: string | null
  saving: boolean
  /** `false` — запись не прошла: форма остаётся открытой. */
  save: (item: T | null, form: Record<string, string>) => Promise<boolean>
  remove: (item: T) => Promise<boolean>
}

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

/** Загрузка и запись справочника по спецификации; состояние диалогов — в экране. */
export function useDictionary<T extends DictionaryEntity, P, R extends object>(
  spec: DictionarySpec<T, P, R>,
): UseDictionaryVm<T, R> {
  const [items, setItems] = useState<T[]>([])
  const [related, setRelated] = useState<R>(
    () => spec.related?.initial ?? ({} as R),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [list, extra] = await Promise.all([
        spec.api.list(),
        spec.related?.load(),
      ])
      setItems(list)
      if (extra) setRelated(extra)
    } catch (e) {
      setError(message(e, 'Ошибка загрузки'))
    } finally {
      setLoading(false)
    }
  }, [spec])

  useEffect(() => {
    ;(async () => {
      await load()
    })()
  }, [load])

  const write = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      setSaving(true)
      try {
        await action()
        await load()
        return true
      } catch (e) {
        setError(message(e, fallback))
        return false
      } finally {
        setSaving(false)
      }
    },
    [load],
  )

  const save = useCallback(
    async (item: T | null, form: Record<string, string>) => {
      const payload = spec.payload(form)
      if (payload === null) return false
      return write(
        () =>
          item ? spec.api.update(item.id, payload) : spec.api.create(payload),
        'Ошибка сохранения',
      )
    },
    [spec, write],
  )

  const remove = useCallback(
    (item: T) => write(() => spec.api.delete(item.id), 'Ошибка удаления'),
    [spec, write],
  )

  return { items, related, loading, error, saving, save, remove }
}
