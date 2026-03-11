import type { Metadata } from "next"
import { LoginPageContent } from "@/components/login-page-content"

export const metadata: Metadata = {
  title: "Sign in — Capo",
  description: "Sign in to your Capo account to manage your songs, setlists, and team."
}

export default function LoginPage() {
  return (
    <>
      {/*
       * Preload the LCP logo using imagesrcset so the browser fetches the
       * correct resolution variant (2x on high-DPR mobile) before the HTML
       * parser reaches the <picture> element. Without this, the browser
       * preloads the 1x WebP but actually fetches the 2x WebP — both download
       * at Low priority because neither matches the preload hint.
       */}
      <link
        rel="preload"
        as="image"
        type="image/webp"
        imageSrcSet="/img/optimized/capo@2x.webp 2x, /img/optimized/capo.webp 1x"
        imageSizes="72px"
      />
      <LoginPageContent />
    </>
  )
}
