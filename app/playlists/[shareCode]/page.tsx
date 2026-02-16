import { notFound } from "next/navigation"

export default async function PublicPlaylistSharePage({
  params
}: {
  params: Promise<{ shareCode: string }>
}) {
  await params
  notFound()
}
