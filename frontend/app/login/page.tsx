"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Loader2, AlertCircle, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Ве молиме пополнете ги сите полиња")
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Најавувањето не успеа")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-semibold text-foreground">AI Document Assistant</span>
      </div>

      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Добредојдовте назад</CardTitle>
          <CardDescription>
            Најавете се за да пристапите до вашата сметка и да ги управувате вашите барања
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
                placeholder="Внесете ја вашата лозинка"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Се најавувате...
                </>
              ) : (
                "Најави се"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="mb-2 font-medium text-foreground">Test Credentials: </p>
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium">citizen:</span> citizen@example.com / c</p>
                <p><span className="font-medium">admin:</span> admin@gov.com / a</p>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {"Немате сметка? "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Регистрирајте се!
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