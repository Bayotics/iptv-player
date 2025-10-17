import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Playlist from "@/lib/models/Playlist"
import Channel from "@/lib/models/Channel"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const playlist = await Playlist.findById(params.id)

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    // Delete associated channels
    await Channel.deleteMany({ playlistId: params.id })

    // Delete playlist
    await Playlist.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Playlist deleted successfully" })
  } catch (error) {
    console.error("Error deleting playlist:", error)
    return NextResponse.json({ error: "Failed to delete playlist" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const playlist = await Playlist.findById(params.id)

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    const channelCount = await Channel.countDocuments({ playlistId: params.id })

    return NextResponse.json({
      playlist: {
        id: playlist._id.toString(),
        name: playlist.name,
        url: playlist.url,
        channelCount,
      },
    })
  } catch (error) {
    console.error("Error fetching playlist:", error)
    return NextResponse.json({ error: "Failed to fetch playlist" }, { status: 500 })
  }
}
