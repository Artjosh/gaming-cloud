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

  supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      flowType: "implicit",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage, // Usar diretamente o localStorage
    },
    // Ativar debug para rastrear problemas
    debug: true,
  })

  // Adicionar listener para depuração de eventos de autenticação
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("Evento de autenticação:", event, session ? "Com sessão" : "Sem sessão")

    // Verificar se a sessão foi salva no localStorage
    if (session) {
      const savedSession = localStorage.getItem("supabase.auth.token")
      console.log("Sessão salva no localStorage:", !!savedSession)
    }
  })

  return supabaseClient
}
