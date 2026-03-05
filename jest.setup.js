import "@testing-library/jest-dom"
import { TextEncoder, TextDecoder } from "util"

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Fix for Next.js 15+ server component imports in Jest/JSDOM
class MockRequest {}
class MockResponse {}
class MockHeaders {}

if (typeof global.Request === "undefined") {
  // @ts-expect-error - mock
  global.Request = MockRequest
}
if (typeof global.Response === "undefined") {
  // @ts-expect-error - mock
  global.Response = MockResponse
}
if (typeof global.Headers === "undefined") {
  // @ts-expect-error - mock
  global.Headers = MockHeaders
}

process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321"
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "test-publishable-key"
