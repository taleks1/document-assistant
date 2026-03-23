"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { User, Save, CheckCircle, Loader2 } from "lucide-react"

const profileSchema = z.object({
  name: z.string().trim().min(2, "Името мора да има најмалку 2 карактери."),
  email: z.string().trim().email("Внеси валидна е-пошта."),
  phone: z.string().trim().min(6, "Внеси валиден телефонски број."),
  department: z.string().trim().min(2, "Одделот мора да има најмалку 2 карактери."),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "Администратор",
      email: user?.email || "admin@gov.com",
      phone: "+389 70 123 456",
      department: "Администрација",
    },
  })

  useEffect(() => {
    form.reset({
      name: user?.name || "Администратор",
      email: user?.email || "admin@gov.com",
      phone: "+389 70 123 456",
      department: "Администрација",
    })
  }, [user, form])

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true)

    try {
      console.log("Зачувани податоци:", values)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Поставки</h1>
        <p className="text-muted-foreground">
          Управувај со твоите подесувања и системска конфигурација
        </p>
      </div>

      <Separator />

      {showSuccess && (
        <Alert className="mb-6 mt-6 border-success/20 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Поставките се успешно зачувани.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6 mt-6">
        <TabsContent value="profile">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Поставки за профил</CardTitle>
              <CardDescription>Ажурирај ги твоите лични податоци</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-10 w-10 text-primary" />
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Име и презиме</Label>
                    <Input id="name" {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Е-пошта</Label>
                    <Input id="email" type="email" {...form.register("email")} />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input id="phone" {...form.register("phone")} />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Оддел</Label>
                    <Input id="department" {...form.register("department")} />
                    {form.formState.errors.department && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.department.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving || form.formState.isSubmitting}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Зачувај промени
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}