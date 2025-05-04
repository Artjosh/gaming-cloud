"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a página
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/user")
        const data = await response.json()

        if (response.ok && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Erro ao fazer login" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return { success: false, error: "Erro ao fazer login" }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Erro ao registrar" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Erro ao registrar:", error)
      return { success: false, error: "Erro ao registrar" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
