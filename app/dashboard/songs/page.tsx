import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getAppContext } from "@/features/app-context/server"
import { SongsClient, api, songsKeys } from "@/features/songs"
import { makeQueryClient } from "@/components/providers/get-query-client"

export const metadata: Metadata = {
  title: "Songs",
  robots: { index: false, follow: false }
}

export default async function SongsPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }

  const queryClient = makeQueryClient()

  await queryClient.prefetchQuery({
    queryKey: songsKeys.list(context),
    queryFn: () => api.getSongs(context)
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SongsClient />
    </HydrationBoundary>
  )
}
