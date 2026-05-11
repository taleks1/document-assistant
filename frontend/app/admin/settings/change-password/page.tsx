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
import { Loader2, Shield, ArrowLeft, CheckCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { apiChangePassword } from "@/lib/api"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Потребни е тековната лозинка"),
  newPassword: z.string().min(8, "Новата лозинка мора да има најмалку 8 карактери"),
  confirmPassword: z.string().min(1, "Потврдете ја новата лозинка"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Лозинките не се совпаѓаат",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function AdminChangePasswordPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: PasswordFormValues) => {
    setIsSaving(true)
    try {
      await apiChangePassword(values.currentPassword, values.newPassword)
      setStatus({ type: "success", message: "Лозинката е успешно променета." })
      setTimeout(() => router.push("/admin/settings"), 3000)
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Грешка при промена на лозинка." })
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
          onClick={() => router.push("/citizen/profile")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Промена на лозинка</h1>
          <p className="text-muted-foreground">Осигурајте ја вашата сметка со силна лозинка</p>
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
          <CardTitle className="text-lg">Детали за лозинка</CardTitle>
          <CardDescription>Внесете ја вашата сегашна и нова лозинка</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Тековна лозинка</Label>
              <Input
                id="currentPassword"
                type="password"
                {...form.register("currentPassword")}
                className="bg-background/50"
                placeholder="••••••••"
              />
              {form.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <Separator />

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Нова лозинка</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...form.register("newPassword")}
                  className="bg-background/50"
                  placeholder="••••••••"
                />
                {form.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Потврди нова лозинка</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  className="bg-background/50"
                  placeholder="••••••••"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={isSaving} className="flex-1 rounded-xl gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Промени лозинка
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

      <div className="mt-8 p-6 border border-primary/20 bg-primary/5 rounded-2xl">
        <div className="flex gap-4 items-start">
          <div className="bg-primary/10 p-2 rounded-full">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1">Совети за безбедност</h3>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
              <li>Користете најмалку 8 карактери</li>
              <li>Вклучете комбинација од букви, бројки и симболи</li>
              <li>Не користете лозинки кои веќе ги користите на други сајтови</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
