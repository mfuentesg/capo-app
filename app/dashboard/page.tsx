import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { getAppContext } from "@/features/app-context/server"
import { api, dashboardKeys } from "@/features/dashboard"
import DashboardClient from "./dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
}

export default async function DashboardPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }

  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.stats(context),
      queryFn: () => api.getDashboardStats(context)
    }),
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.recentSongs(context, 3),
      queryFn: () => api.getRecentSongs(context, 3)
    })
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
