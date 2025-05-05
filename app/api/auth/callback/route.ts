import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/login-error?error=no_code", requestUrl.origin))
    }

    const supabase = createServerClient()

    // Troca o código pelo token de acesso
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Erro ao trocar código por sessão:", error)
      return NextResponse.redirect(new URL(`/login-error?error=${error.message}`, requestUrl.origin))
    }

    // Redirecionar para o dashboard após login bem-sucedido
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
  } catch (error) {
    console.error("Erro no callback de autenticação:", error)
    return NextResponse.redirect(new URL("/login-error?error=server_error", request.url))
  }
}
