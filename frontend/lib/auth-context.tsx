"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  apiAuthenticate,
  apiRegister,
  apiGetCurrentUser,
  type User as ApiUser,
} from "@/lib/api"

export type UserRole = "citizen" | "admin"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  firstname: string
  lastname: string
  embg: string | null
  gender: string | null
  nationality: string | null
  phone: string | null
  city: string | null
  address: string | null
  cardId: string | null
  birthDate: string | null
  cardIssueDate: string | null
  cardExpiryDate: string | null
  active: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    firstname: string,
    lastname: string,
    email: string,
    password: string
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─── Token helpers (localStorage) ────────────────────────────────────────────

const TOKEN_KEY = "auth_token"

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── Role normalisation ───────────────────────────────────────────────────────

function normaliseRole(raw: string): UserRole {
  return raw.toLowerCase() === "admin" ? "admin" : "citizen"
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true) // true on mount while we re-hydrate
  const router = useRouter()

  // Re-hydrate session from stored JWT on first load
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    apiGetCurrentUser()
      .then((u: ApiUser) => {
        setUser({
          id: String(u.id),
          email: u.email,
          name: `${u.firstname} ${u.lastname}`,
          firstname: u.firstname,
          lastname: u.lastname,
          role: normaliseRole(u.role),
          embg: u.embg,
          gender: u.gender,
          nationality: u.nationality,
          phone: u.phone,
          city: u.city,
          address: u.address,
          cardId: u.cardId,
          birthDate: u.birthDate,
          cardIssueDate: u.cardIssueDate,
          cardExpiryDate: u.cardExpiryDate,
          active: u.active,
        })
      })
      .catch(() => {
        clearToken()
      })
      .finally(() => setIsLoading(false))
  }, [])

  // ── login ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      try {
        const { token, role } = await apiAuthenticate(email, password)
        saveToken(token)

        const u = await apiGetCurrentUser()
        const normalised = normaliseRole(role)

        setUser({
          id: String(u.id),
          email: u.email,
          name: `${u.firstname} ${u.lastname}`,
          firstname: u.firstname,
          lastname: u.lastname,
          role: normalised,
          embg: u.embg,
          gender: u.gender,
          nationality: u.nationality,
          phone: u.phone,
          city: u.city,
          address: u.address,
          cardId: u.cardId,
          birthDate: u.birthDate,
          cardIssueDate: u.cardIssueDate,
          cardExpiryDate: u.cardExpiryDate,
          active: u.active,
        })

        router.push(normalised === "admin" ? "/admin" : "/citizen")
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  // ── register ───────────────────────────────────────────────────────────────

  const register = useCallback(
    async (
      firstname: string,
      lastname: string,
      email: string,
      password: string
    ) => {
      setIsLoading(true)
      try {
        const { token, role } = await apiRegister(firstname, lastname, email, password)
        saveToken(token)

        const u = await apiGetCurrentUser()
        const normalised = normaliseRole(role)

        setUser({
          id: String(u.id),
          email: u.email,
          name: `${u.firstname} ${u.lastname}`,
          firstname: u.firstname,
          lastname: u.lastname,
          role: normalised,
          embg: u.embg,
          gender: u.gender,
          nationality: u.nationality,
          phone: u.phone,
          city: u.city,
          address: u.address,
          cardId: u.cardId,
          birthDate: u.birthDate,
          cardIssueDate: u.cardIssueDate,
          cardExpiryDate: u.cardExpiryDate,
          active: u.active,
        })

        router.push(normalised === "admin" ? "/admin" : "/citizen")
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  // ── logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    clearToken()
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
