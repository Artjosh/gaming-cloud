import { createClient } from "@supabase/supabase-js"

// Criando o cliente Supabase no cliente
let supabaseClient: ReturnType<typeof createClient> | null = null

export function createClientClient() {
  if (supabaseClient) return supabaseClient

  // Log para depuração
  console.log("Criando cliente Supabase com fluxo implícito")

  // Verificar se estamos no navegador
  if (typeof window === "undefined") {
    throw new Error("createClientClient deve ser chamado apenas no cliente")
  }

  // Definir a chave de armazenamento personalizada para garantir consistência
  const storageKey = "sb-auth-token"

  supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      flowType: "implicit",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: storageKey,
    },
    // Ativar debug para rastrear problemas
    debug: true,
  })

  // Adicionar listener para depuração de eventos de autenticação
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("Evento de autenticação:", event, session ? "Com sessão" : "Sem sessão")

    // Verificar se a sessão foi salva no localStorage
    if (session) {
      const savedSession = localStorage.getItem(storageKey)
      console.log("Sessão salva no localStorage:", !!savedSession)

      // Se a sessão não foi salva, tentar salvar manualmente
      if (!savedSession) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(session))
          console.log("Sessão salva manualmente no localStorage")
        } catch (e) {
          console.error("Erro ao salvar sessão manualmente:", e)
        }
      }
    }
  })

  // Adicionar a propriedade storageKey ao cliente para acesso externo
  // @ts-ignore - Adicionando propriedade personalizada
  supabaseClient.auth.storageKey = storageKey

  return supabaseClient
}
