import { sql } from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      )
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${hashedPassword})
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
