import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin

    // Validação básica
    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    console.log(`Enviando magic link para ${email} com redirecionamento para ${origin}`)

    const supabase = createServerClient()

    // Enviar magic link com redirecionamento para a raiz do site
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: origin,
        shouldCreateUser: true, // Criar usuário se não existir
      },
    })

    if (error) {
      console.error("Erro ao enviar magic link:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("Magic link enviado com sucesso")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar magic link:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
