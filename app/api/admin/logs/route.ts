import { NextResponse } from "next/server"

// Mock logs for demonstration
// In production, these would come from a logging service or database
const mockLogs = [
  {
    id: "1",
    type: "info" as const,
    message: "New playlist added: Demo Playlist",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    type: "info" as const,
    message: "Device registered: abc123def456",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "3",
    type: "warning" as const,
    message: "Failed to parse 3 channels from playlist",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "4",
    type: "info" as const,
    message: "Channel playback started: BBC News",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "5",
    type: "error" as const,
    message: "HLS stream error: Network timeout",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
]

export async function GET() {
  try {
    return NextResponse.json({ logs: mockLogs })
  } catch (error) {
    console.error("Admin logs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
