"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Save,
  CheckCircle,
  Loader2,
  Mail,
  Shield,
  Settings as SettingsIcon,
  LogOut
} from "lucide-react"
import { apiUpdateUser, User as ApiUser } from "@/lib/api"

const profileSchema = z.object({
  firstname: z.string().trim().min(2, "Името мора да има најмалку 2 карактери."),
  lastname: z.string().trim().min(2, "Презимето мора да има најмалку 2 карактери."),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { user, refreshUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
      })
    }
  }, [user, form])

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true)
    try {
      await apiUpdateUser(values as Partial<ApiUser>)
      await refreshUser()
      setIsEditing(false)
      setStatus({ type: "success", message: "Профилот е успешно ажуриран." })
      setTimeout(() => setStatus(null), 5000)
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Грешка при ажурирање на профилот." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Поставки</h1>
        <p className="text-muted-foreground">Управувајте со вашата администраторска сметка</p>
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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main profile section */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between px-0 pt-0 gap-4">
                <div>
                  <CardTitle className="text-xl">Лични информации</CardTitle>
                  <CardDescription>Вашите основни податоци</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setIsEditing(true)}
                    >
                      Измени
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="rounded-xl" onClick={handleCancel}>
                        Откажи
                      </Button>

                      <Button type="submit" disabled={isSaving} className="gap-2 rounded-xl">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Зачувај
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-0 space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-sm">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.firstname} {user.lastname}</h2>
                    <p className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">{user.role}</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstname" className="text-xs text-muted-foreground uppercase font-bold">Име</Label>
                    <Input
                      id="firstname"
                      readOnly={!isEditing}
                      {...form.register("firstname")}
                      className={`bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`}
                    />
                    {form.formState.errors.firstname && <p className="text-xs text-destructive">{form.formState.errors.firstname.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="text-xs text-muted-foreground uppercase font-bold">Презиме</Label>
                    <Input
                      id="lastname"
                      readOnly={!isEditing}
                      {...form.register("lastname")}
                      className={`bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`}
                    />
                    {form.formState.errors.lastname && <p className="text-xs text-destructive">{form.formState.errors.lastname.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-muted-foreground uppercase font-bold">Е-пошта</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        readOnly
                        value={user.email}
                        className="pl-10 bg-muted/50 opacity-70 cursor-default focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-6">
          <Card className="border border-border/50 bg-muted/30 shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/50 border-b border-border/50">
              <CardTitle className="text-base">Поставки за сметка</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/settings/change-email")}
                  className="w-full rounded-xl gap-2 justify-start bg-background hover:bg-muted"
                >
                  <Mail className="h-4 w-4" />
                  Промени е-пошта
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/settings/change-password")}
                  className="w-full rounded-xl gap-2 justify-start bg-background hover:bg-muted"
                >
                  <Shield className="h-4 w-4" />
                  Промени лозинка
                </Button>

                <Separator className="my-2" />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Одјави се
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}