import { type NextRequest, NextResponse } from "next/server"
import { loginTokens } from "../login-email/route"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    // Verificar se o token existe e está autenticado
    if (loginTokens.has(token)) {
      const loginData = loginTokens.get(token)!

      if (loginData.authenticated) {
        // Limpar o token após uso bem-sucedido
        loginTokens.delete(token)
        return NextResponse.json({ authenticated: true })
      }

      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao verificar status de login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
