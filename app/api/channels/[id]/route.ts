import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Channel from "@/lib/models/Channel"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const channel = await Channel.findById(params.id)

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    return NextResponse.json({
      channel: {
        id: channel._id.toString(),
        name: channel.name,
        logo: channel.logo,
        group: channel.group,
        streamUrl: channel.streamUrl,
        type: channel.type,
      },
    })
  } catch (error) {
    console.error("Error fetching channel:", error)
    return NextResponse.json({ error: "Failed to fetch channel" }, { status: 500 })
  }
}
