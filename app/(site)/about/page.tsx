import { Rocket } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Rocket className="h-8 w-8" />
      </div>
      <p className="text-2xl font-semibold text-foreground">
        В будущих релизах
      </p>
    </div>
  )
}
