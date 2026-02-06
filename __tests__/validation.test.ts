import { describe, it, expect } from "vitest"
import {
  validateTitle,
  validateStatus,
  validateEmail,
  validatePassword,
  validateName,
  sanitizeTaskInput,
  VALID_STATUSES,
} from "@/lib/validation"

describe("validateTitle", () => {
  it("rejects empty string", () => {
    expect(validateTitle("")).toEqual({ valid: false, error: "Title is required" })
  })

  it("rejects null/undefined", () => {
    expect(validateTitle(null).valid).toBe(false)
    expect(validateTitle(undefined).valid).toBe(false)
  })

  it("rejects whitespace-only string", () => {
    expect(validateTitle("   ").valid).toBe(false)
  })

  it("accepts a valid title", () => {
    expect(validateTitle("Build landing page")).toEqual({ valid: true })
  })

  it("rejects titles over 200 characters", () => {
    const longTitle = "a".repeat(201)
    expect(validateTitle(longTitle).valid).toBe(false)
  })

  it("accepts a title at exactly 200 characters", () => {
    const title = "a".repeat(200)
    expect(validateTitle(title).valid).toBe(true)
  })
})

describe("validateStatus", () => {
  it("accepts all valid statuses", () => {
    for (const status of VALID_STATUSES) {
      const result = validateStatus(status)
      expect(result.valid).toBe(true)
      expect(result.normalized).toBe(status)
    }
  })

  it("defaults to 'todo' for invalid status", () => {
    expect(validateStatus("invalid")).toEqual({ valid: false, normalized: "todo" })
  })

  it("defaults to 'todo' for null/undefined", () => {
    expect(validateStatus(null).normalized).toBe("todo")
    expect(validateStatus(undefined).normalized).toBe("todo")
  })
})

describe("validateEmail", () => {
  it("rejects empty email", () => {
    expect(validateEmail("").valid).toBe(false)
  })

  it("rejects email without @", () => {
    expect(validateEmail("invalidemail").valid).toBe(false)
  })

  it("accepts valid email", () => {
    expect(validateEmail("user@example.com").valid).toBe(true)
  })

  it("rejects non-string values", () => {
    expect(validateEmail(123).valid).toBe(false)
    expect(validateEmail(null).valid).toBe(false)
  })
})

describe("validatePassword", () => {
  it("rejects short passwords", () => {
    expect(validatePassword("12345")).toEqual({
      valid: false,
      error: "Password must be at least 6 characters",
    })
  })

  it("rejects empty password", () => {
    expect(validatePassword("").valid).toBe(false)
  })

  it("accepts valid password", () => {
    expect(validatePassword("secure123")).toEqual({ valid: true })
  })

  it("accepts exactly 6 characters", () => {
    expect(validatePassword("123456").valid).toBe(true)
  })
})

describe("validateName", () => {
  it("rejects single character", () => {
    expect(validateName("A").valid).toBe(false)
  })

  it("rejects empty string", () => {
    expect(validateName("").valid).toBe(false)
  })

  it("accepts valid name", () => {
    expect(validateName("John Doe")).toEqual({ valid: true })
  })

  it("accepts two-character name", () => {
    expect(validateName("Jo").valid).toBe(true)
  })
})

describe("sanitizeTaskInput", () => {
  it("trims whitespace from title and description", () => {
    const result = sanitizeTaskInput({
      title: "  My Task  ",
      description: "  A description  ",
      status: "todo",
    })
    expect(result.title).toBe("My Task")
    expect(result.description).toBe("A description")
    expect(result.status).toBe("todo")
  })

  it("converts empty description to null", () => {
    const result = sanitizeTaskInput({
      title: "My Task",
      description: "",
    })
    expect(result.description).toBeNull()
  })

  it("defaults invalid status to 'todo'", () => {
    const result = sanitizeTaskInput({
      title: "My Task",
      status: "invalid",
    })
    expect(result.status).toBe("todo")
  })

  it("handles null description", () => {
    const result = sanitizeTaskInput({
      title: "My Task",
      description: null,
    })
    expect(result.description).toBeNull()
  })

  it("handles undefined description", () => {
    const result = sanitizeTaskInput({
      title: "My Task",
    })
    expect(result.description).toBeNull()
  })
})
