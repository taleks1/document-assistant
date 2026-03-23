"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Upload, Brain, Search, CheckCircle, ArrowRight, Shield, Clock, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">AI Document Assistant</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Најава</Button>
            </Link>
            <Link href="/register">
              <Button>Регистрација</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-card to-background py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Shield className="h-4 w-4" />
              Официјален портал за услуги
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Поднесување на адмиснтративни барања
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              Прикачете го вашиот документ за идентификација, дозволете нашата вештачка интелигенција автоматски 
              да ги извлече вашите податоци и поднесете ги вашите административни барања за неколку минути. Следете го статусот 
              на вашите апликации од поднесување до одобрување.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Започни
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Најави се на твојата сметка
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Како функционира</h2>
            <p className="text-muted-foreground">Четири едноставни чекори за да го завршите вашето административно барање</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative border-border bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Прикачи личен документ</h3>
                <p className="text-sm text-muted-foreground">
                  Безбедно прикачете го вашиот документ за идентификација. Поддржуваме JPG, PNG и PDF формати.
                </p>
              </CardContent>
            </Card>
            <Card className="relative border-border bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">AI екстракција</h3>
                <p className="text-sm text-muted-foreground">
                  Нашата вештачка интелигенција автоматски ги извлекува вашите лични податоци од документот.
                </p>
              </CardContent>
            </Card>
            <Card className="relative border-border bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Поднеси барање</h3>
                <p className="text-sm text-muted-foreground">
                  Прегледајте ги извлечените податоци, пополнете дополнителни информации и поднесете го вашето барање.
                </p>
              </CardContent>
            </Card>
            <Card className="relative border-border bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Следи статус</h3>
                <p className="text-sm text-muted-foreground">
                  Следете го статусот на вашето барање во реално време, од поднесување до конечна одлука.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Зошто да ја изберете нашата платформа</h2>
            <p className="text-muted-foreground">Современа технологија за ефикасна јавна администрација</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Clock className="h-8 w-8 text-success" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Брза обработка</h3>
              <p className="text-muted-foreground">
                Обработката на документи со помош на вештачка интелигенција го намалува времето на чекање и ја забрзува обработката на вашето барање.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Безбедно и приватно</h3>
              <p className="text-muted-foreground">
                Вашите документи и лични податоци се енкриптирани и се обработуваат со највисоко ниво на безбедност.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-info/10">
                <Users className="h-8 w-8 text-info" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Достапност 24/7</h3>
              <p className="text-muted-foreground">
                Поднесувајте и следете ги вашите барања во секое време, од каде било. Нема потреба да посетувате владини институции.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">Подготвен/а да започнеш?</h2>
          <p className="mb-8 text-primary-foreground/80">
            Придружи им се на илјадници граѓани кои ја користат нашата платформа за побрзи административни услуги.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Креирај сметка
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="gap-2">
                Најава
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">AI Document Assistant</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Официјален портал за дигитални  услуги
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">Политика за приватност</Link>
              <Link href="#" className="hover:text-foreground">Услови за користење</Link>
              <Link href="#" className="hover:text-foreground">Контакт</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}