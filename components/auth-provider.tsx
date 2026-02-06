"use client"

import React, { createContext, useContext, useCallback, useEffect, useState } from "react"
import type { AuthUser } from "@/lib/auth"

type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = "taskflow_session_token"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      const token = getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user ?? null)
        } else {
          clearToken()
          setUser(null)
        }
      } catch {
        clearToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }

    setToken(data.token)
    setUser(data.user)
    return {}
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }

    setToken(data.token)
    setUser(data.user)
    return {}
  }, [])

  const logout = useCallback(async () => {
    const token = getToken()
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    }
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
