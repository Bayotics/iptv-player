import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Channel from "@/lib/models/Channel"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("playlistId")
    const type = searchParams.get("type")

    if (!playlistId) {
      return NextResponse.json({ error: "playlistId is required" }, { status: 400 })
    }

    const query: any = { playlistId }

    if (type) {
      query.type = type
    }

    const channels = await Channel.find(query)

    const mappedChannels = channels.map((channel) => ({
      id: channel._id.toString(),
      name: channel.name,
      logo: channel.tvgLogo,
      group: channel.groupTitle,
      streamUrl: channel.streamUrl,
      type: channel.type,
      tvgId: channel.tvgId,
      metadata: channel.metadata,
    }))

    return NextResponse.json({
      channels: mappedChannels,
      totalCount: mappedChannels.length,
    })
  } catch (error) {
    console.error("Channels fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}
