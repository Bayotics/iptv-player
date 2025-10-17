import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Playlist from "@/lib/models/Playlist"
import Channel from "@/lib/models/Channel"
import Device from "@/lib/models/Device"
import { parseM3U } from "@/lib/m3u-parser"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, url, content, deviceKey } = body

    if (!name || !deviceKey) {
      return NextResponse.json({ error: "Name and deviceKey are required" }, { status: 400 })
    }

    if (!url && !content) {
      return NextResponse.json({ error: "URL or content is required" }, { status: 400 })
    }

    // Get or create device
    let device = await Device.findOne({ deviceKey })
    if (!device) {
      device = await Device.create({ deviceKey, playlists: [] })
    }

    // Fetch content if URL provided
    let m3uContent = content
    if (url && !content) {
      const response = await fetch(url)
      m3uContent = await response.text()
    }

    // Parse the playlist
    const parseResult = parseM3U(m3uContent)

    // Create playlist
    const playlist = await Playlist.create({
      name,
      url,
      content: m3uContent,
      deviceKey,
      isActive: true,
      lastParsed: new Date(),
      parseErrors: parseResult.errors,
    })

    // Create channels
    const channelDocs = await Channel.insertMany(
      parseResult.channels.map((ch) => ({
        ...ch,
        playlistId: playlist._id,
      })),
    )

    // Update playlist with channel IDs
    playlist.channels = channelDocs.map((ch) => ch._id)
    await playlist.save()

    // Add playlist to device
    device.playlists.push(playlist._id)
    await device.save()

    return NextResponse.json({
      success: true,
      playlist: {
        id: playlist._id,
        name: playlist.name,
        channelCount: channelDocs.length,
      },
    })
  } catch (error) {
    console.error("Playlist creation error:", error)
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const deviceKey = searchParams.get("deviceKey")

    const query = deviceKey ? { deviceKey, isActive: true } : { isActive: true }

    const playlists = await Playlist.find(query).select("name url createdAt").sort({ createdAt: -1 })

    const playlistsWithCount = await Promise.all(
      playlists.map(async (playlist) => {
        const channelCount = await Channel.countDocuments({ playlistId: playlist._id })
        const activePlaylistId = typeof localStorage !== "undefined" ? localStorage.getItem("activePlaylistId") : null

        return {
          id: playlist._id.toString(),
          name: playlist.name,
          url: playlist.url,
          channelCount,
          isActive: playlist._id.toString() === activePlaylistId,
        }
      }),
    )

    return NextResponse.json({ playlists: playlistsWithCount })
  } catch (error) {
    console.error("Playlist fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 })
  }
}
