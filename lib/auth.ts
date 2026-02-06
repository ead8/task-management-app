import { sql } from "@/lib/db"
import { headers } from "next/headers"
import crypto from "crypto"

// --- Password hashing using Node.js crypto (pbkdf2) ---

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const ITERATIONS = 100000
const DIGEST = "sha512"

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex")
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, key) => {
      if (err) reject(err)
      resolve(`${salt}:${key.toString("hex")}`)
    })
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":")
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err)
      resolve(key === derivedKey.toString("hex"))
    })
  })
}

// --- Session management ---

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `

  return token
}

export type AuthUser = {
  id: number
  name: string
  email: string
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const headerStore = await headers()
    const authHeader = headerStore.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) return null

    const token = authHeader.slice(7)
    if (!token) return null

    const result = await sql`
      SELECT u.id, u.name, u.email
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ${token}
        AND s.expires_at > NOW()
    `

    if (result.length === 0) return null

    return result[0] as AuthUser
  } catch {
    return null
  }
}

export async function deleteSession(token: string) {
  await sql`DELETE FROM sessions WHERE id = ${token}`
}
