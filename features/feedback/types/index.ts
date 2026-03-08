export interface FeedbackPayload {
  name?: string
  email?: string
  message: string
  newsletterOptIn: boolean
}

export interface FeedbackResult {
  success: boolean
  error?: string
}
