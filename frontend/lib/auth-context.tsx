"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "citizen" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo
const mockUsers: Record<string, User & { password: string }> = {
  "citizen@example.com": {
    id: "1",
    email: "citizen@example.com",
    name: "John Citizen",
    password: "c",
    role: "citizen",
  },
  "admin@gov.com": {
    id: "2",
    email: "admin@gov.com",
    name: "Sarah Administrator",
    password: "a",
    role: "admin",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const foundUser = mockUsers[email]
    if (!foundUser || foundUser.password !== password) {
      setIsLoading(false)
      throw new Error("Invalid email or password")
    }
    
    const { password: _, ...userWithoutPassword } = foundUser
    setUser(userWithoutPassword)
    setIsLoading(false)
    
    // Redirect based on role
    if (foundUser.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/citizen")
    }
  }, [router])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    if (mockUsers[email]) {
      setIsLoading(false)
      throw new Error("Email already registered")
    }
    
    // Create new user (in real app, this would be an API call)
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: "citizen",
    }
    
    mockUsers[email] = { ...newUser, password }
    setUser(newUser)
    setIsLoading(false)
    router.push("/citizen")
  }, [router])

  const logout = useCallback(() => {
    setUser(null)
    router.push("/")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
