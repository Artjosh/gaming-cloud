import { type NextRequest, NextResponse } from "next/server"
import { loginTokens } from "../login-email/route"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { loginToken } = await request.json()

    if (!loginToken) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    console.log(`[notify-login] Recebendo notificação para token ${loginToken}`)

    // Verificar se o token existe
    if (!loginTokens.has(loginToken)) {
      console.log(`[notify-login] Token ${loginToken} não encontrado`)
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    // Obter a sessão atual do servidor
    const supabase = createServerClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("[notify-login] Erro ao obter sessão:", sessionError)
      return NextResponse.json({ error: "Erro ao obter sessão" }, { status: 500 })
    }

    if (!sessionData.session) {
      console.log("[notify-login] Sessão não encontrada")
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 400 })
    }

    // Obter dados do usuário
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      console.error("[notify-login] Erro ao obter usuário:", userError)
      return NextResponse.json({ error: "Erro ao obter usuário" }, { status: 500 })
    }

    console.log(`[notify-login] Atualizando token ${loginToken} com dados de autenticação`)

    // Atualizar o token com os dados da sessão e do usuário
    loginTokens.set(loginToken, {
      ...loginTokens.get(loginToken),
      authenticated: true,
      session: sessionData.session,
      user: userData.user,
      timestamp: Date.now(),
    })

    // Imprimir o conteúdo do token para depuração
    console.log(`[notify-login] Token ${loginToken} atualizado:`, {
      authenticated: true,
      user: userData.user.id,
      session: sessionData.session.access_token ? "Tem access_token" : "Sem access_token",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[notify-login] Erro ao notificar login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
