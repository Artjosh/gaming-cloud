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
  sendLoginEmail: (email: string) => Promise<{ success: boolean; error?: string; token?: string }>
  verifyOTP: (email: string, token: string, loginToken: string) => Promise<{ success: boolean; error?: string }>
  checkLoginStatus: (token: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  processAuthHash: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Função unificada para obter o usuário atual
  const fetchUser = useCallback(async () => {
    try {
      // Primeiro, tentamos obter a sessão do cliente Supabase
      const supabase = createClientClient()
      const { data: sessionData } = await supabase.auth.getSession()

      if (sessionData.session) {
        const { data: userData } = await supabase.auth.getUser()
        if (userData && userData.user) {
          setUser(userData.user as User)
          return true
        }
      }

      // Se não tivermos uma sessão válida no cliente, tentamos a API do servidor
      const response = await fetch("/api/auth/user")
      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        return true
      } else {
        setUser(null)
        return false
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      setUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para processar o hash de autenticação (centralizada aqui)
  const processAuthHash = useCallback(async () => {
    if (typeof window === "undefined") return false

    const hashParams = window.location.hash
    if (!hashParams || !hashParams.includes("access_token")) return false

    try {
      setLoading(true)
      console.log("Processando hash de autenticação")

      const supabase = createClientClient()

      // O cliente Supabase processará automaticamente o hash
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Erro ao obter sessão:", error)
        return false
      }

      if (data.session) {
        // Atualizar o usuário após autenticação bem-sucedida
        await fetchUser()

        // Limpar o hash da URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return true
      }

      return false
    } catch (error) {
      console.error("Erro ao processar hash de autenticação:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchUser])

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

  const sendLoginEmail = async (email: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/login-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Verificar se o erro é de email não confirmado
        if (data.error && data.error.includes("Email not confirmed")) {
          return { success: false, error: "Email not confirmed" }
        }
        return { success: false, error: data.error || "Erro ao enviar email" }
      }

      return { success: true, token: data.token }
    } catch (error) {
      console.error("Erro ao enviar email de login:", error)
      return { success: false, error: "Erro ao enviar email" }
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (email: string, token: string, loginToken: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, loginToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Código inválido" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Erro ao verificar OTP:", error)
      return { success: false, error: "Erro ao verificar código" }
    } finally {
      setLoading(false)
    }
  }

  const checkLoginStatus = async (token: string) => {
    try {
      const response = await fetch("/api/auth/check-login-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      if (data.authenticated) {
        await fetchUser()
        return { success: true }
      }

      return { success: false }
    } catch (error) {
      console.error("Erro ao verificar status de login:", error)
      return { success: false, error: "Erro ao verificar status" }
    }
  }

  const register = async (email: string, name: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Erro ao registrar" }
      }

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
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendLoginEmail,
        verifyOTP,
        checkLoginStatus,
        register,
        logout,
        refreshUser,
        processAuthHash,
      }}
    >
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
