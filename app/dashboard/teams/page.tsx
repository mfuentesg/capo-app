import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { getSelectedTeamId } from "@/features/app-context/server"
import { TeamsClient, api, teamsKeys } from "@/features/teams"

export default async function TeamsPage() {
  const queryClient = new QueryClient()

  const [, initialSelectedTeamId] = await Promise.all([
    queryClient.prefetchQuery({
      queryKey: teamsKeys.list(),
      queryFn: () => api.getTeams()
    }),
    getSelectedTeamId()
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeamsClient initialSelectedTeamId={initialSelectedTeamId} />
    </HydrationBoundary>
  )
}
