import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

// Armazenamento temporário para tokens de login (em produção, use Redis ou outro armazenamento persistente)
// Estrutura: { email, authenticated, timestamp, session, user }
export const loginTokens = new Map<string, any>()

// Limpar tokens antigos periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of loginTokens.entries()) {
    if (data.timestamp && now - data.timestamp > 3600000) {
      // 1 hora
      loginTokens.delete(token)
    }
  }
}, 3600000) // Verificar a cada hora

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin

    // Validação básica
    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Gerar token único para este login
    const loginToken = randomUUID()

    console.log(`[login-email] Criando token ${loginToken} para ${email}`)

    // Armazenar token com timestamp
    loginTokens.set(loginToken, {
      email,
      authenticated: false,
      timestamp: Date.now(),
    })

    const supabase = createServerClient()

    // Verificar se o usuário já existe
    const { data: existingUsers, error: searchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1)

    if (searchError) {
      console.error("Erro ao verificar usuário existente:", searchError)
    }

    // Se o usuário não existir, criá-lo automaticamente
    if (!existingUsers || existingUsers.length === 0) {
      try {
        // Criar o usuário no auth
        const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            // URL para onde o usuário será redirecionado após clicar no magic link
            // Incluímos o token de login para identificar a sessão
            emailRedirectTo: `${origin}/auth/callback?login_token=${loginToken}`,
          },
        })

        if (authError) {
          return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        // Criar o usuário na tabela users
        await supabase.from("users").insert({
          email: email,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Erro ao criar usuário:", error)
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
      }
    } else {
      // Usuário já existe, apenas enviar o email de login
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // URL para onde o usuário será redirecionado após clicar no magic link
          // Incluímos o token de login para identificar a sessão
          emailRedirectTo: `${origin}/auth/callback?login_token=${loginToken}`,
        },
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Atualizar o último login
      await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("email", email)
    }

    return NextResponse.json({ success: true, token: loginToken })
  } catch (error) {
    console.error("Erro ao enviar email de login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
