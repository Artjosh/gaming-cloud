import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const origin = requestUrl.origin

    // Verificar se temos um código ou um token de acesso (para compatibilidade com ambos os fluxos)
    if (!code && !requestUrl.hash.includes("access_token")) {
      console.error("Nenhum código ou token encontrado na URL:", requestUrl.toString())
      return NextResponse.redirect(new URL("/login-error?error=no_code", origin))
    }

    const supabase = createServerClient()

    if (code) {
      // Fluxo PKCE - trocar o código pelo token de acesso
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Erro ao trocar código por sessão:", error)
        return NextResponse.redirect(new URL(`/login-error?error=${encodeURIComponent(error.message)}`, origin))
      }
    }
    // Se não houver código, mas houver um hash com access_token, o cliente já processou o token

    // Redirecionar para o dashboard após login bem-sucedido
    return NextResponse.redirect(new URL("/dashboard", origin))
  } catch (error) {
    console.error("Erro no callback de autenticação:", error)
    return NextResponse.redirect(new URL("/login-error?error=server_error", request.url))
  }
}
