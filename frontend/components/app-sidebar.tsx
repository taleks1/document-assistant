"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Search,
  FolderOpen,
  HelpCircle,
  User,
  Users,
  BarChart3,
  Download,
  Settings,
  LogOut,
  FileCheck,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const citizenNavItems: NavItem[] = [
  { label: "Почетна", href: "/citizen", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Креирај ново барање", href: "/citizen/new-request", icon: <FilePlus className="h-5 w-5" /> },
  { label: "Мои барања", href: "/citizen/requests", icon: <FileText className="h-5 w-5" /> },
  { label: "Следење статус", href: "/citizen/tracking", icon: <Search className="h-5 w-5" /> },
  { label: "Профил", href: "/citizen/profile", icon: <User className="h-5 w-5" /> },
]

const adminNavItems: NavItem[] = [
  { label: "Контролна табла", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Барања", href: "/admin/requests", icon: <FileText className="h-5 w-5" /> },
  { label: "Корисници", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
  { label: "Поставки", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
]

interface AppSidebarProps {
  role: UserRole
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const navItems = role === "admin" ? adminNavItems : citizenNavItems

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <FileCheck className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Document Assistant</span>
          <span className="text-xs text-muted-foreground capitalize">{role}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
            <User className="h-5 w-5 text-sidebar-accent-foreground" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "Корисник"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Одјави се
        </Button>
      </div>
    </aside>
  )
}