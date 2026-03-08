import type { Metadata } from "next"
import { LoginPageContent } from "@/components/login-page-content"

export const metadata: Metadata = {
  title: "Sign in — Capo",
  description: "Sign in to your Capo account to manage your songs, setlists, and team."
}

export default function LoginPage() {
  return <LoginPageContent />
}
