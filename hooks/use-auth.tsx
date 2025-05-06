"use client"
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { createClientClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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
  const [authInitialized, setAuthInitialized] = useState(false)
  const router = useRouter()

  // Função para verificar se estamos na página de callback
  const isAuthCallbackPage = useCallback(() => {
    if (typeof window === "undefined") return false
    return sessionStorage.getItem("is_auth_callback") === "true"
  }, [])

  // Função para verificar se há uma sessão no localStorage
  const hasLocalStorageSession = useCallback(() => {
    if (typeof window === "undefined") return false
    const key = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`
    return !!localStorage.getItem(key)
  }, [])

  // Função para obter o usuário diretamente da API do servidor
  const fetchUserFromServer = useCallback(async () => {
    try {
      console.log("[fetchUserFromServer] Obtendo usuário da API do servidor")
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/auth/user?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        // Adicionar um timeout para evitar que a requisição fique pendente indefinidamente
        signal: AbortSignal.timeout(5000), // 5 segundos de timeout
      })

      if (!response.ok) {
        console.log("[fetchUserFromServer] Resposta da API não ok:", response.status)
        return { success: false, user: null }
      }

      const data = await response.json()

      if (data.user) {
        console.log("[fetchUserFromServer] Usuário encontrado na API:", data.user.id)
        setUser(data.user)
        return { success: true, user: data.user, session: data.session }
      } else {
        console.log("[fetchUserFromServer] Nenhum usuário encontrado na API")
        setUser(null)
        return { success: false, user: null }
      }
    } catch (error) {
      console.error("[fetchUserFromServer] Erro ao obter usuário da API:", error)
      return { success: false, user: null, error }
    }
  }, [])

  // Função unificada para obter o usuário atual
  const fetchUser = useCallback(async () => {
    try {
      console.log("[fetchUser] Iniciando busca de usuário")

      // Verificar se há uma sessão no localStorage
      const hasSession = hasLocalStorageSession()
      console.log("[fetchUser] Sessão no localStorage:", hasSession ? "Sim" : "Não")

      // Se houver uma sessão no localStorage, tentar obter o usuário diretamente da API do servidor
      if (hasSession) {
        console.log("[fetchUser] Tentando obter usuário da API do servidor devido à sessão no localStorage")
        const result = await fetchUserFromServer()
        if (result.success && result.user) {
          console.log("[fetchUser] Usuário obtido com sucesso da API do servidor")

          // Tentar sincronizar a sessão com o cliente Supabase
          if (result.session) {
            try {
              const supabase = createClientClient()
              await supabase.auth.setSession({
                access_token: result.session.access_token,
                refresh_token: result.session.refresh_token,
              })
              console.log("[fetchUser] Sessão sincronizada com o cliente Supabase")
            } catch (e) {
              console.error("[fetchUser] Erro ao sincronizar sessão com o cliente Supabase:", e)
            }
          }

          return true
        }
      }

      // Primeiro, tentamos obter a sessão do cliente Supabase
      const supabase = createClientClient()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("[fetchUser] Erro ao obter sessão:", sessionError)
        setUser(null)
        return false
      }

      if (sessionData.session) {
        console.log("[fetchUser] Sessão encontrada no cliente, buscando usuário")
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error("[fetchUser] Erro ao obter usuário:", userError)
          setUser(null)
          return false
        }

        if (userData && userData.user) {
          console.log("[fetchUser] Usuário encontrado no cliente:", userData.user.id)
          setUser(userData.user as User)
          return true
        }
      } else {
        console.log("[fetchUser] Nenhuma sessão encontrada no cliente, tentando API do servidor")
      }

      // Se não tivermos uma sessão válida no cliente, tentamos a API do servidor
      const result = await fetchUserFromServer()
      return result.success
    } catch (error) {
      console.error("[fetchUser] Erro geral ao verificar autenticação:", error)
      setUser(null)
      return false
    } finally {
      console.log("[fetchUser] Finalizando busca de usuário, definindo loading como false")
      setLoading(false)
      setAuthInitialized(true)
    }
  }, [fetchUserFromServer, hasLocalStorageSession])

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
    const initAuth = async () => {
      try {
        console.log("[initAuth] Iniciando verificação de autenticação")

        // Verificar se há uma sessão no localStorage
        const hasSession = hasLocalStorageSession()
        console.log("[initAuth] Sessão no localStorage:", hasSession ? "Sim" : "Não")

        // Se houver uma sessão no localStorage, forçar uma verificação com a API do servidor
        if (hasSession) {
          console.log("[initAuth] Forçando verificação com a API do servidor devido à sessão no localStorage")
          await fetchUserFromServer()
        } else {
          await fetchUser()
        }

        console.log("[initAuth] Verificação de autenticação concluída")
      } catch (error) {
        console.error("[initAuth] Erro ao inicializar autenticação:", error)
      } finally {
        setLoading(false)
        setAuthInitialized(true)
      }
    }

    initAuth()

    // Configurar listener para mudanças de autenticação
    const supabase = createClientClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Com sessão" : "Sem sessão")

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await fetchUser()

        // Redirecionar para o dashboard após login bem-sucedido
        // Mas apenas se NÃO estivermos na página de callback
        if (event === "SIGNED_IN" && !isAuthCallbackPage()) {
          router.push("/dashboard")
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser, router, isAuthCallbackPage, hasLocalStorageSession, fetchUserFromServer])

  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  const sendLoginEmail = async (email: string) => {
    try {
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
    }
  }

  const verifyOTP = async (email: string, token: string, loginToken: string) => {
    try {
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

      // Se temos dados de sessão e usuário, atualizar o estado
      if (data.session && data.user) {
        setUser(data.user)

        // Tentar atualizar a sessão no cliente
        const supabase = createClientClient()
        try {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          })
        } catch (e) {
          console.error("Erro ao definir sessão após OTP:", e)
        }
      } else {
        // Caso contrário, buscar o usuário normalmente
        await fetchUser()
      }

      return { success: true }
    } catch (error) {
      console.error("Erro ao verificar OTP:", error)
      return { success: false, error: "Erro ao verificar código" }
    }
  }

  const checkLoginStatus = async (token: string) => {
    try {
      console.log(`[useAuth] Verificando status do token ${token}`)

      const response = await fetch("/api/auth/check-login-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[useAuth] Erro na resposta do check-login-status:", data.error)
        return { success: false, error: data.error }
      }

      console.log(`[useAuth] Resposta do check-login-status:`, {
        authenticated: data.authenticated,
        hasUser: !!data.user,
        hasSession: !!data.session,
      })

      if (data.authenticated) {
        // Se temos dados de sessão e usuário, atualizar o estado
        if (data.session && data.user) {
          console.log("[useAuth] Atualizando usuário e sessão a partir do check-login-status")

          // Atualizar o usuário no estado
          setUser(data.user)

          // Tentar atualizar a sessão no cliente
          const supabase = createClientClient()
          try {
            console.log("[useAuth] Tentando definir sessão no cliente Supabase")

            const result = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            })

            if (result.error) {
              console.error("[useAuth] Erro ao definir sessão:", result.error)
            } else {
              console.log("[useAuth] Sessão definida com sucesso no cliente Supabase")
            }
          } catch (e) {
            console.error("[useAuth] Exceção ao definir sessão:", e)
          }

          return { success: true }
        } else {
          console.log("[useAuth] Token autenticado, mas sem dados de sessão/usuário")
        }
      }

      return { success: data.authenticated }
    } catch (error) {
      console.error("[useAuth] Erro ao verificar status de login:", error)
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

      // Primeiro, limpar o estado local
      setUser(null)

      // Obter o cliente Supabase
      const supabase = createClientClient()

      // Limpar o localStorage manualmente para garantir
      if (typeof window !== "undefined") {
        // Limpar todo o localStorage relacionado ao Supabase
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith("supabase.") || key.includes("auth"))) {
            console.log(`Removendo item do localStorage: ${key}`)
            localStorage.removeItem(key)
            // Ajustar o índice após remover um item
            i--
          }
        }
      }

      // Chamar o signOut do Supabase
      await supabase.auth.signOut({ scope: "global" })

      // Também chamamos a API do servidor para garantir que todas as sessões sejam limpas
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Redirecionar para a página inicial após logout
      router.push("/")
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
        loading: loading && !authInitialized, // Só consideramos loading se ainda não inicializamos a autenticação
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
