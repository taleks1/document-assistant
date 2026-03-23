"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const { register, isLoading } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword) {
      setError("Ве молиме пополнете ги сите полиња")
      return
    }

    if (password.length < 8) {
      setError("Лозинката мора да има најмалку 8 карактери")
      return
    }

    if (password !== confirmPassword) {
      setError("Лозинките не се совпаѓаат")
      return
    }

    try {
      await register(name, email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Регистрацијата не успеа")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-semibold text-foreground">AI Документ Асистент</span>
      </div>

      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Креирајте сметка</CardTitle>
          <CardDescription>
            Регистрирајте се за да започнете со поднесување и следење на вашите барања
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Име и презиме</Label>
              <Input
                id="name"
                type="text"
                placeholder="Име Презиме"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Е-пошта</Label>
              <Input
                id="email"
                type="email"
                placeholder="Внесете го вашиот емаил"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Лозинка</Label>
              <Input
                id="password"
                type="password"
                placeholder="Креирајте силна лозинка"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Минимум 8 карактери</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Потврди лозинка</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Потврдете ја лозинката"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Се креира сметка...
                </>
              ) : (
                "Креирај сметка"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">Со регистрација добивате:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  AI обработка на документи
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Следење на барања во реално време
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Безбедно складирање на документи
                </li>
              </ul>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Веќе имате сметка?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Најавете се!
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <Link href="/" className="mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Назад кон почетна
      </Link>
    </div>
  )
}