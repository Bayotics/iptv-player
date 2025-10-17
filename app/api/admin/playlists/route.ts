import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Playlist from "@/lib/models/Playlist"
import Channel from "@/lib/models/Channel"

export async function GET() {
  try {
    await connectDB()

    const playlists = await Playlist.find({ isActive: true })
      .select("name url deviceKey createdAt")
      .sort({ createdAt: -1 })

    const playlistsWithCount = await Promise.all(
      playlists.map(async (playlist) => {
        const channelCount = await Channel.countDocuments({ playlistId: playlist._id })

        return {
          id: playlist._id.toString(),
          name: playlist.name,
          url: playlist.url,
          deviceKey: playlist.deviceKey,
          channelCount,
          createdAt: playlist.createdAt,
        }
      }),
    )

    return NextResponse.json({ playlists: playlistsWithCount })
  } catch (error) {
    console.error("Admin playlists fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 })
  }
}
