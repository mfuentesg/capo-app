import { redirect } from "next/navigation"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { getAppContext } from "@/features/app-context/server"
import { SongsClient, api, songsKeys } from "@/features/songs"

export default async function SongsPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }

  const queryClient = new QueryClient()

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
