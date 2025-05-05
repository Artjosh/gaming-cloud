import { type NextRequest, NextResponse } from "next/server"
import { loginTokens } from "../login-email/route"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    console.log(`[check-login-status] Verificando token ${token}`)

    // Verificar se o token existe
    if (!loginTokens.has(token)) {
      console.log(`[check-login-status] Token ${token} não encontrado`)
      return NextResponse.json({ authenticated: false, error: "Token inválido ou expirado" }, { status: 400 })
    }

    const loginData = loginTokens.get(token)

    // Verificar se o token está autenticado
    if (loginData.authenticated) {
      console.log(`[check-login-status] Token ${token} está autenticado`)

      // Verificar se temos dados de sessão e usuário
      if (loginData.session && loginData.user) {
        console.log(`[check-login-status] Retornando dados de sessão e usuário para token ${token}`)

        // Criar uma cópia dos dados para retornar
        const responseData = {
          authenticated: true,
          user: loginData.user,
          session: loginData.session,
        }

        // Limpar o token após uso bem-sucedido
        loginTokens.delete(token)
        console.log(`[check-login-status] Token ${token} removido após uso`)

        return NextResponse.json(responseData)
      } else {
        console.log(`[check-login-status] Token ${token} está autenticado, mas sem dados de sessão/usuário`)
      }
    }

    console.log(`[check-login-status] Token ${token} não está autenticado`)
    return NextResponse.json({ authenticated: false })
  } catch (error) {
    console.error("[check-login-status] Erro ao verificar status de login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
