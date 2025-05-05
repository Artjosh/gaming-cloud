import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validação básica
    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Enviar OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Não criar usuário se não existir
      },
    })

    if (error) {
      // Verificar se o erro é de email não confirmado
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json({ error: "Email not confirmed" }, { status: 401 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar OTP:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
