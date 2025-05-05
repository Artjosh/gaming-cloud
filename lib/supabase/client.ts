import { createClient } from "@supabase/supabase-js"

// Criando o cliente Supabase no cliente
let supabaseClient: ReturnType<typeof createClient> | null = null

export function createClientClient() {
  if (supabaseClient) return supabaseClient

  // Log para depuração
  console.log("Criando cliente Supabase com fluxo implícito")

  supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      flowType: "implicit",
      autoRefreshToken: true,
      persistSession: true,
      storageKey: "supabase.auth.token", // Garantir que a chave de armazenamento seja consistente
      detectSessionInUrl: true, // Ativar detecção automática de sessão na URL
      storage: {
        getItem: (key) => {
          try {
            return localStorage.getItem(key)
          } catch (error) {
            console.error("Erro ao acessar localStorage:", error)
            return null
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value)
          } catch (error) {
            console.error("Erro ao definir localStorage:", error)
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key)
          } catch (error) {
            console.error("Erro ao remover do localStorage:", error)
          }
        },
      },
    },
    debug: true, // Ativar debug para rastrear problemas
  })

  // Adicionar listener para depuração de eventos de autenticação
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("Evento de autenticação:", event, session ? "Com sessão" : "Sem sessão")
  })

  return supabaseClient
}
