import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

// Interface para os dados de login
interface LoginData {
  email: string
  authenticated: boolean
  timestamp?: number
  session?: any
  user?: any
}

// Armazenamento temporário para tokens de login (em produção, use Redis ou outro armazenamento persistente)
const loginTokens = new Map<string, LoginData>()

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

    // Armazenar token com timestamp
    loginTokens.set(loginToken, {
      email,
      authenticated: false,
      timestamp: Date.now(),
    })

    const supabase = createServerClient()

    // Enviar email com OTP e Magic Link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // URL para onde o usuário será redirecionado após clicar no magic link
        // Incluímos o token de login para identificar a sessão
        emailRedirectTo: `${origin}/auth/callback?login_token=${loginToken}`,
      },
    })

    if (error) {
      // Verificar se o erro é de email não confirmado
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json({ error: "Email not confirmed" }, { status: 401 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, token: loginToken })
  } catch (error) {
    console.error("Erro ao enviar email de login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Exportar loginTokens para ser usado por outras rotas
export { loginTokens }
