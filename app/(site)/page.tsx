import Link from 'next/link'
import { Database, Calculator, FlaskConical, MapPin, ArrowRight, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Database,
    title: 'База данных продуктов',
    description: 'Химический, аминокислотный и минеральный состав продуктов питания по регионам Кыргызстана.',
  },
  {
    icon: Calculator,
    title: 'Калькулятор нутриентов',
    description: 'Рассчитайте содержание нутриентов для выбранных продуктов и нужного веса порции.',
  },
  {
    icon: MapPin,
    title: 'Данные по регионам',
    description: 'Состав продуктов с учётом региональных особенностей и условий выращивания.',
  },
  {
    icon: FlaskConical,
    title: 'Полный нутриентный профиль',
    description: 'Белки, жиры, углеводы, витамины, макро- и микроэлементы в одном месте.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
              <Leaf className="h-4 w-4 text-success" />
              Нутриентный состав продуктов Кыргызстана
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              База данных продуктов питания
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Изучайте химический, аминокислотный и минеральный состав продуктов,
              рассчитывайте нутриенты для своего рациона.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/database">
                  Открыть базу данных
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/calculator">
                  <Calculator className="mr-2 h-4 w-4" />
                  Калькулятор
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Возможности</h2>
          <p className="mt-3 text-muted-foreground">
            Всё необходимое для работы с данными о составе продуктов
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-accent/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-8 lg:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Начните работу с базой данных
            </h2>
            <p className="mt-2 text-muted-foreground">
              Поиск по продуктам, фильтрация по категориям и регионам.
            </p>
          </div>
          <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
            <Link href="/database">
              Перейти к базе данных
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
