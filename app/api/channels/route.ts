import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Channel from "@/lib/models/Channel"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("playlistId")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    if (!playlistId) {
      return NextResponse.json({ error: "playlistId is required" }, { status: 400 })
    }

    const query: any = { playlistId }

    if (type) {
      query.type = type
    }

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    if (category) {
      query.groupTitle = category
    }

    const channels = await Channel.find(query).sort({ name: 1 }).limit(100)

    return NextResponse.json({ channels })
  } catch (error) {
    console.error("Channels fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}
