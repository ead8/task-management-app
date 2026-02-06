"use client"

import { useAuth } from "@/components/auth-provider"
import { AuthForm } from "@/components/auth-form"
import { TaskBoard } from "@/components/task-board"
import { Loader2 } from "lucide-react"

export default function Page() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <TaskBoard />
      </div>
    </main>
  )
}
