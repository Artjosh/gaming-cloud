import { createClient } from "@supabase/supabase-js"

// Criando o cliente Supabase no cliente
let supabaseClient: ReturnType<typeof createClient> | null = null

export function createClientClient() {
  if (supabaseClient) return supabaseClient

  supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      persistSession: true,
    },
  })

  return supabaseClient
}
