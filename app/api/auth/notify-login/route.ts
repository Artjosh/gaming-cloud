import { type NextRequest, NextResponse } from "next/server"
import { loginTokens } from "../login-email/route"
import { createServerClient } from "@/lib/supabase/server"

// Armazenamento temporário para sessões e usuários
interface LoginData {
  email: string
  authenticated: boolean
  timestamp?: number
  session?: any
  user?: any
}

export async function POST(request: NextRequest) {
  try {
    const { loginToken } = await request.json()

    if (!loginToken) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    // Verificar se o token existe
    if (!loginTokens.has(loginToken)) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    // Obter a sessão atual do servidor
    const supabase = createServerClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Erro ao obter sessão:", sessionError)
      return NextResponse.json({ error: "Erro ao obter sessão" }, { status: 500 })
    }

    if (!sessionData.session) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 400 })
    }

    // Obter dados do usuário
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      console.error("Erro ao obter usuário:", userError)
      return NextResponse.json({ error: "Erro ao obter usuário" }, { status: 500 })
    }

    // Atualizar o token com os dados da sessão e do usuário
    const loginData: LoginData = {
      ...loginTokens.get(loginToken)!,
      authenticated: true,
      session: sessionData.session,
      user: userData.user,
      timestamp: Date.now(),
    }

    loginTokens.set(loginToken, loginData)

    console.log(`Login notificado com sucesso para o token ${loginToken}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao notificar login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
