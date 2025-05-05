import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin

    // Validação básica
    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verificar se o usuário já existe
    const { data: existingUsers, error: searchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .limit(1)

    if (searchError) {
      console.error("Erro ao verificar usuário existente:", searchError)
      return NextResponse.json({ error: "Erro ao verificar usuário existente" }, { status: 500 })
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: "Este email já está em uso" }, { status: 400 })
    }

    // Registrar o usuário usando OTP (sem senha)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      options: {
        data: {
          full_name: name || "",
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Criar perfil do usuário se necessário
    if (authData.user) {
      try {
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: email,
          full_name: name,
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Erro ao criar perfil do usuário:", error)
        // Não falhar o registro se o perfil não puder ser criado
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
