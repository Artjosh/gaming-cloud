"use client"
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { createClientClient } from "@/lib/supabase/client"

interface User {
  id: string
  email?: string
  email_confirmed_at?: string | null
  user_metadata?: {
    full_name?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      // Primeiro, tentamos obter a sessão do cliente Supabase
      const supabase = createClientClient()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Erro ao obter sessão:", sessionError)
        setUser(null)
        setLoading(false)
        return
      }

      if (sessionData.session) {
        console.log("Sessão encontrada no cliente, obtendo dados do usuário")
        const { data: userData } = await supabase.auth.getUser()

        if (userData && userData.user) {
          setUser(userData.user as User)
          setLoading(false)
          return
        }
      }

      // Se não tivermos uma sessão válida no cliente, tentamos a API do servidor
      console.log("Tentando obter usuário da API do servidor")
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
  }, [])

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a página
    fetchUser()

    // Configurar listener para mudanças de autenticação
    const supabase = createClientClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await fetchUser()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser])

  const refreshUser = useCallback(async () => {
    setLoading(true)
    await fetchUser()
  }, [fetchUser])

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
        // Verificar se o erro é de email não confirmado
        if (data.error && data.error.includes("Email not confirmed")) {
          return { success: false, error: "Email not confirmed" }
        }
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

  const loginWithMagicLink = async (email: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Erro ao enviar o link de acesso" }
      }

      return { success: true }
    } catch (error) {
      console.error("Erro ao enviar magic link:", error)
      return { success: false, error: "Erro ao enviar o link de acesso" }
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
      const supabase = createClientClient()
      await supabase.auth.signOut()

      // Também chamamos a API do servidor para garantir que todas as sessões sejam limpas
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

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithMagicLink, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
