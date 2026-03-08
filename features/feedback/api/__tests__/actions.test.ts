import { createClient } from "@/lib/supabase/server"
import { submitFeedback } from "../actions"

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn()
}))

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: "email-id" })
    }
  }))
}))

describe("submitFeedback", () => {
  const mockInsert = jest.fn()
  const mockFrom = jest.fn(() => ({ insert: mockInsert }))

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({ from: mockFrom })
    mockInsert.mockResolvedValue({ error: null })
    delete process.env.RESEND_API_KEY
  })

  it("returns error when message is too short", async () => {
    const result = await submitFeedback({ message: "hi", newsletterOptIn: false })
    expect(result).toEqual({ success: false, error: "Message is too short" })
    expect(createClient).not.toHaveBeenCalled()
  })

  it("returns error when message is empty", async () => {
    const result = await submitFeedback({ message: "", newsletterOptIn: false })
    expect(result).toEqual({ success: false, error: "Message is too short" })
  })

  it("returns error when message is only whitespace", async () => {
    const result = await submitFeedback({ message: "    ", newsletterOptIn: false })
    expect(result).toEqual({ success: false, error: "Message is too short" })
  })

  it("inserts feedback into the database and returns success", async () => {
    const result = await submitFeedback({
      name: "Alice",
      email: "alice@example.com",
      message: "Great app!",
      newsletterOptIn: true
    })

    expect(result).toEqual({ success: true })
    expect(mockFrom).toHaveBeenCalledWith("feedback")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Alice",
        email: "alice@example.com",
        message: "Great app!",
        newsletter_opt_in: true,
        opt_in_at: expect.any(String)
      })
    )
  })

  it("stores null for opt_in_at when newsletterOptIn is false", async () => {
    await submitFeedback({ message: "Nice work", newsletterOptIn: false })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ newsletter_opt_in: false, opt_in_at: null })
    )
  })

  it("trims optional fields and stores null when blank", async () => {
    await submitFeedback({ name: "  ", email: "  ", message: "Good stuff", newsletterOptIn: false })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: null, email: null })
    )
  })

  it("returns error when DB insert fails", async () => {
    mockInsert.mockResolvedValue({ error: { message: "DB constraint violated" } })
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    const result = await submitFeedback({ message: "Hello world", newsletterOptIn: false })

    expect(result).toEqual({ success: false, error: "Failed to save feedback" })
    consoleSpy.mockRestore()
  })

  it("sends email via Resend when RESEND_API_KEY is set", async () => {
    process.env.RESEND_API_KEY = "re_test_key"
    const { Resend } = await import("resend")
    const mockSend = jest.fn().mockResolvedValue({ id: "email-id" })
    ;(Resend as jest.Mock).mockImplementation(() => ({ emails: { send: mockSend } }))

    const result = await submitFeedback({
      name: "Bob",
      message: "Awesome product",
      newsletterOptIn: false
    })

    expect(result).toEqual({ success: true })
    expect(Resend).toHaveBeenCalledWith("re_test_key")
    expect(mockSend).toHaveBeenCalled()
    delete process.env.RESEND_API_KEY
  })

  it("skips email sending when RESEND_API_KEY is not set", async () => {
    const { Resend } = await import("resend")

    await submitFeedback({ message: "No email test", newsletterOptIn: false })

    expect(Resend).not.toHaveBeenCalled()
  })

  it("returns unexpected error on thrown exception", async () => {
    ;(createClient as jest.Mock).mockRejectedValue(new Error("unexpected"))
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    const result = await submitFeedback({ message: "Test message", newsletterOptIn: false })

    expect(result).toEqual({ success: false, error: "Unexpected error" })
    consoleSpy.mockRestore()
  })
})
