import { type NextRequest, NextResponse } from "next/server"
import { loginTokens } from "../login-email/route"
import { createServerClient } from "@/lib/supabase/server"

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
        // Obter a sessão do servidor para garantir que está atualizada
        const supabase = createServerClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao obter sessão:", error)
          return NextResponse.json({ error: "Erro ao verificar sessão" }, { status: 500 })
        }

        // Limpar o token após uso bem-sucedido
        loginTokens.delete(token)

        // Retornar informações da sessão para o cliente
        return NextResponse.json({
          authenticated: true,
          session: data.session,
        })
      }

      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao verificar status de login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
