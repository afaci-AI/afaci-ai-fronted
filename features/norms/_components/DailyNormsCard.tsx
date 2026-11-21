'use client'

import type { DailyNorms } from '../api'
import { MacroCard, MicroCard, OtherCard } from './NutrientBlocks'

/**
 * Макросостав, микросостав и прочее продукта или рецептуры.
 * Все значения приходят с backend; клиент их не считает.
 */
export function DailyNormsCard({
  data,
  subject,
  withOther = true,
}: {
  data: DailyNorms
  /** Что описывает таблица: «продукта» или «рецептуры». */
  subject: string
  /** «Прочее» можно вывести отдельно (в конце результата калькулятора). */
  withOther?: boolean
}) {
  return (
    <>
      <MacroCard data={data} subject={subject} />
      <MicroCard rows={data.micro} subject={subject} />
      {withOther ? <OtherCard rows={data.other} subject={subject} /> : null}
    </>
  )
}
