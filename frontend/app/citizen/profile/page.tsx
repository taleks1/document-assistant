"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Save, CheckCircle, Loader2, Mail, Phone, MapPin, Hash, Shield, Calendar, Globe, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const profileSchema = z.object({
  firstname: z.string().trim().min(2, "Името мора да има најмалку 2 карактери"),
  lastname: z.string().trim().min(2, "Презимето мора да има најмалку 2 карактери"),
  email: z.string().trim().email("Внесете валидна е-пошта"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  embg: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  cardId: z.string().trim().optional(),
  birthDate: z.string().trim().optional(),
  cardIssueDate: z.string().trim().optional(),
  cardExpiryDate: z.string().trim().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, logout } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      embg: user?.embg || "",
      gender: user?.gender || "",
      nationality: user?.nationality || "",
      cardId: user?.cardId || "",
      birthDate: user?.birthDate || "",
      cardIssueDate: user?.cardIssueDate || "",
      cardExpiryDate: user?.cardExpiryDate || "",
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        embg: user.embg || "",
        gender: user.gender || "",
        nationality: user.nationality || "",
        cardId: user.cardId || "",
        birthDate: user.birthDate || "",
        cardIssueDate: user.cardIssueDate || "",
        cardExpiryDate: user.cardExpiryDate || "",
      })
    }
  }, [user, form])

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true)
    // In a real app, this would be an API call to update the user profile
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Мој Профил</h1>
        <p className="text-muted-foreground">
          Преглед и управување со вашите лични податоци
        </p>
      </div>

      <Separator className="mb-8" />

      {showSuccess && (
        <Alert className="mb-6 border-success/20 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Вашиот профил е успешно ажуриран.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main profile section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="flex flex-row items-center justify-between px-0 pt-0">
                <div>
                  <CardTitle className="text-xl">Лични информации</CardTitle>
                  <CardDescription>Основни податоци за вашиот идентитет</CardDescription>
                </div>

                {!isEditing ? (
                  <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                    Измени
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Откажи
                    </Button>
                    <Button type="submit" disabled={isSaving} className="gap-2">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Зачувај
                    </Button>
                  </div>
                )}
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
                    <Input id="firstname" disabled={!isEditing} {...form.register("firstname")} className="bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="text-xs text-muted-foreground uppercase font-bold">Презиме</Label>
                    <Input id="lastname" disabled={!isEditing} {...form.register("lastname")} className="bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-muted-foreground uppercase font-bold">Е-пошта</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" disabled={!isEditing} {...form.register("email")} className="pl-10 bg-background/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs text-muted-foreground uppercase font-bold">Телефон</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" disabled={!isEditing} {...form.register("phone")} className="pl-10 bg-background/50" />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <CardTitle className="text-lg mb-4">Дополнителни детали</CardTitle>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="embg" className="text-xs text-muted-foreground uppercase font-bold">ЕМБГ</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="embg" disabled={!isEditing} {...form.register("embg")} className="pl-10 bg-background/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-xs text-muted-foreground uppercase font-bold">Датум на раѓање</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="birthDate" disabled={!isEditing} {...form.register("birthDate")} className="pl-10 bg-background/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-xs text-muted-foreground uppercase font-bold">Пол</Label>
                    <Input id="gender" disabled={!isEditing} {...form.register("gender")} className="bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-xs text-muted-foreground uppercase font-bold">Државјанство</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="nationality" disabled={!isEditing} {...form.register("nationality")} className="pl-10 bg-background/50" />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <CardTitle className="text-lg mb-4">Адреса и локација</CardTitle>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs text-muted-foreground uppercase font-bold">Град</Label>
                    <Input id="city" disabled={!isEditing} {...form.register("city")} className="bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs text-muted-foreground uppercase font-bold">Адреса</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="address" disabled={!isEditing} {...form.register("address")} className="pl-10 bg-background/50" />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <CardTitle className="text-lg mb-4">Документи за идентификација</CardTitle>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cardId" className="text-xs text-muted-foreground uppercase font-bold">Број на лична карта</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="cardId" disabled={!isEditing} {...form.register("cardId")} className="pl-10 bg-background/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardIssueDate" className="text-xs text-muted-foreground uppercase font-bold">Датум на издавање</Label>
                    <Input id="cardIssueDate" disabled={!isEditing} {...form.register("cardIssueDate")} className="bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardExpiryDate" className="text-xs text-muted-foreground uppercase font-bold">Датум на истекување</Label>
                    <Input id="cardExpiryDate" disabled={!isEditing} {...form.register("cardExpiryDate")} className="bg-background/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar actions */}
          <div className="space-y-6">
            <Card className="border border-border/50 bg-muted/30 shadow-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border/50">
                <CardTitle className="text-base">Брзи акции</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button type="button" variant="outline" className="w-full justify-start rounded-xl bg-background hover:bg-muted transition-all">
                  <FileText className="mr-2 h-4 w-4" />
                  Преземи ги моите податоци
                </Button>

                <Button type="button" variant="outline" className="w-full justify-start rounded-xl bg-background hover:bg-muted transition-all">
                  <Shield className="mr-2 h-4 w-4" />
                  Побарај бришење на сметка
                </Button>

                <Separator className="my-2" />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Одјави се
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-primary/5 shadow-none rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-1">Безбедност на податоци</h3>
                <p className="text-xs text-muted-foreground">Вашите податоци се заштитени и се користат само за државни услуги.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}