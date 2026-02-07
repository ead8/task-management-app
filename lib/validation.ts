// Shared validation utilities used by API routes and tests

export const VALID_STATUSES = ["todo", "in-progress", "done"] as const
export type TaskStatus = (typeof VALID_STATUSES)[number]

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwerty123",
  "letmein",
  "admin",
  "welcome",
  "iloveyou",
])

export function validateTitle(title: unknown): { valid: boolean; error?: string } {
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return { valid: false, error: "Title is required" }
  }
  if (title.trim().length > 200) {
    return { valid: false, error: "Title must be 200 characters or less" }
  }
  return { valid: true }
}

export function validateStatus(status: unknown): { valid: boolean; normalized: TaskStatus } {
  if (typeof status === "string" && VALID_STATUSES.includes(status as TaskStatus)) {
    return { valid: true, normalized: status as TaskStatus }
  }
  return { valid: false, normalized: "todo" }
}

export function validateEmail(email: unknown): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" }
  }
  const trimmed = email.trim().toLowerCase()
  if (!trimmed.includes("@") || trimmed.length < 5) {
    return { valid: false, error: "Valid email is required" }
  }
  return { valid: true }
}

export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    }
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      valid: false,
      error: `Password must be ${PASSWORD_MAX_LENGTH} characters or less`,
    }
  }

  if (/\s/.test(password)) {
    return { valid: false, error: "Password must not contain spaces" }
  }

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  if (!hasLowercase || !hasUppercase || !hasNumber || !hasSymbol) {
    return {
      valid: false,
      error:
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one symbol",
    }
  }

  const normalized = password.toLowerCase()
  if (COMMON_PASSWORDS.has(normalized) || normalized.includes("password")) {
    return { valid: false, error: "Password is too common" }
  }

  return { valid: true }
}

export function validateName(name: unknown): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" }
  }
  return { valid: true }
}

export function sanitizeTaskInput(input: {
  title: string
  description?: string | null
  status?: string
}) {
  return {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status: validateStatus(input.status).normalized,
  }
}
