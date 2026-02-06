"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { LogOut, User } from "lucide-react"

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-card p-1 shadow-lg">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={async () => {
              setIsOpen(false)
              await logout()
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
