"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft, CheckCircle, Shield } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { apiChangeEmail } from "@/lib/api"

const emailSchema = z.object({
  email: z.string().trim().email("Внесете валидна е-пошта"),
})

type EmailFormValues = z.infer<typeof emailSchema>

export default function AdminChangeEmailPage() {
  const router = useRouter()
  const { user, updateSession } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || "",
    },
  })

  const onSubmit = async (values: EmailFormValues) => {
    setIsSaving(true)
    try {
      const { token, role } = await apiChangeEmail(values.email)
      await updateSession(token, role)
      setStatus({ type: "success", message: "Е-поштата е успешно променета." })
      setTimeout(() => router.push("/admin/settings"), 3000)
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Грешка при промена на е-пошта." })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/admin/settings")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Промена на е-пошта</h1>
          <p className="text-muted-foreground">Ажурирајте ја вашата администраторска е-пошта</p>
        </div>
      </div>

      <Separator className="mb-8" />

      {status && (
        <Alert className={`mb-6 ${status.type === "success" ? "border-success/20 bg-success/10 text-success" : "border-destructive/20 bg-destructive/10 text-destructive"}`}>
          {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          <AlertDescription>
            {status.message}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/50 bg-muted/30 shadow-none rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border/50">
          <CardTitle className="text-lg">Нова е-пошта</CardTitle>
          <CardDescription>Внесете ја вашата нова администраторска е-пошта.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Нова е-пошта</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  {...form.register("email")} 
                  className="pl-10 bg-background/50" 
                  placeholder="admin@example.com"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={isSaving} className="flex-1 rounded-xl gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Промени е-пошта
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/admin/settings")}
                className="flex-1 rounded-xl"
              >
                Откажи
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
