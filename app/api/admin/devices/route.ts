import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Device from "@/lib/models/Device"

export async function GET() {
  try {
    await connectDB()

    const devices = await Device.find().select("deviceKey playlists lastActive createdAt").sort({ lastActive: -1 })

    const devicesData = devices.map((device) => ({
      id: device._id.toString(),
      deviceKey: device.deviceKey,
      playlistCount: device.playlists.length,
      lastActive: device.lastActive || device.createdAt,
    }))

    return NextResponse.json({ devices: devicesData })
  } catch (error) {
    console.error("Admin devices fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
  }
}
