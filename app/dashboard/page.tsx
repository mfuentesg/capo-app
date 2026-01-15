"use client"

import Link from "next/link"
import { Music, ListMusic, Plus, Calendar, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import KeyBadge from "@/components/key-badge"
import { useTranslation } from "@/hooks/use-translation"
import { ActivityFeed, useActivityRealtime } from "@/features/activity"
import { mockDashboardStats as stats, mockDashboardRecentSongs as recentSongs } from "@/features/dashboard"


export default function DashboardPage() {
  const { t } = useTranslation()

  // Enable real-time activity updates
  useActivityRealtime()

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.dashboard.title}</h1>
              <p className="text-muted-foreground">{t.dashboard.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                asChild
                className="transition-all hover:shadow-md bg-transparent"
              >
                <Link href="/dashboard/playlists">
                  <ListMusic className="mr-2 h-4 w-4" />
                  {t.dashboard.newPlaylist}
                </Link>
              </Button>
              <Button asChild className="transition-all hover:shadow-md">
                <Link href="/dashboard/songs">
                  <Plus className="mr-2 h-4 w-4" />
                  {t.dashboard.addSong}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSongs}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.totalSongs}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <ListMusic className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPlaylists}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.playlists}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+{stats.songsThisMonth}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.thisMonth}</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/playlists"
              className="block rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <Calendar className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.upcomingPlaylists}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.upcoming}</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">{t.dashboard.recentlyAdded}</h3>
                  <p className="text-sm text-muted-foreground">{t.dashboard.latestSongs}</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
                  <Link href="/dashboard/songs">
                    {t.dashboard.viewAll}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3 p-4">
                {recentSongs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/dashboard/songs/${song.id}`}
                    className="flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-muted/50 hover:shadow-sm cursor-pointer"
                  >
                    <KeyBadge keyValue={song.key} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="rounded-full">
                        {song.bpm} BPM
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {song.addedAt}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{t.dashboard.recentActivity}</h3>
                <p className="text-sm text-muted-foreground">{t.dashboard.recentActivityDescription}</p>
              </div>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
