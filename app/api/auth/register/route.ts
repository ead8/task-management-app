import { sql } from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth"
import { validateEmail, validateName, validatePassword } from "@/lib/validation"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error ?? "Name is invalid" },
        { status: 400 }
      )
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error ?? "Email is invalid" },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error ?? "Password is invalid" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await sql`SELECT id FROM users WHERE email = ${normalizedEmail}`
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name.trim()}, ${normalizedEmail}, ${hashedPassword})
      RETURNING id, name, email
    `

    const user = result[0]
    const token = await createSession(user.id)

    return NextResponse.json(
      { token, user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration failed:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
