import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { loginTokens } from "../login-email/route"

export async function POST(request: NextRequest) {
  try {
    const { email, token, loginToken } = await request.json()

    // Validação básica
    if (!email || !token) {
      return NextResponse.json({ error: "Email e código são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verificar OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Se temos um loginToken, marcar como autenticado
    if (loginToken && loginTokens.has(loginToken)) {
      loginTokens.set(loginToken, {
        ...loginTokens.get(loginToken)!,
        authenticated: true,
      })
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    console.error("Erro ao verificar OTP:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
