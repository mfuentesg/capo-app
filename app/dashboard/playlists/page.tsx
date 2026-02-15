import { redirect } from "next/navigation"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { getAppContext } from "@/features/app-context/server"
import { PlaylistsClient, api, playlistsKeys } from "@/features/playlists"

export default async function PlaylistsPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: playlistsKeys.list(context),
    queryFn: () => api.getPlaylists(context)
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlaylistsClient />
    </HydrationBoundary>
  )
}
