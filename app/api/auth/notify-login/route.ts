import { type NextRequest, NextResponse } from "next/server"
import { loginTokens } from "../login-email/route"

export async function POST(request: NextRequest) {
  try {
    const { loginToken, session, user } = await request.json()

    if (!loginToken) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    console.log(`[notify-login] Recebendo notificação para token ${loginToken}`)

    // Verificar se o token existe
    if (!loginTokens.has(loginToken)) {
      console.log(`[notify-login] Token ${loginToken} não encontrado`)
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    // Verificar se temos os dados da sessão e do usuário
    if (!session || !user) {
      console.log("[notify-login] Dados de sessão ou usuário não fornecidos")
      return NextResponse.json({ error: "Dados de sessão e usuário são obrigatórios" }, { status: 400 })
    }

    console.log(`[notify-login] Atualizando token ${loginToken} com dados de autenticação`)

    // Atualizar o token com os dados da sessão e do usuário
    loginTokens.set(loginToken, {
      ...loginTokens.get(loginToken),
      authenticated: true,
      session: session,
      user: user,
      timestamp: Date.now(),
    })

    // Imprimir o conteúdo do token para depuração
    console.log(`[notify-login] Token ${loginToken} atualizado:`, {
      authenticated: true,
      user: user.id,
      session: session.access_token ? "Tem access_token" : "Sem access_token",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[notify-login] Erro ao notificar login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
