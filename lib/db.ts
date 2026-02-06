import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export type Task = {
  id: number
  title: string
  description: string | null
  status: "todo" | "in-progress" | "done"
  user_id: number | null
  created_at: string
  updated_at: string
}

export type User = {
  id: number
  name: string
  email: string
  created_at: string
}
