import { type NextRequest, NextResponse } from "next/server"
import { parseM3U, validatePlaylistUrl } from "@/lib/m3u-parser"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, content } = body

    if (!url && !content) {
      return NextResponse.json({ error: "URL or content is required" }, { status: 400 })
    }

    let m3uContent = content

    // If URL is provided, fetch the content
    if (url) {
      const validation = await validatePlaylistUrl(url)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      try {
        const response = await fetch(url)
        if (!response.ok) {
          return NextResponse.json({ error: `Failed to fetch playlist: ${response.statusText}` }, { status: 400 })
        }
        m3uContent = await response.text()
      } catch (error) {
        return NextResponse.json(
          {
            error: `Failed to fetch playlist: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 400 },
        )
      }
    }

    // Parse the M3U content
    const parseResult = parseM3U(m3uContent)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Failed to parse playlist",
          details: parseResult.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      channels: parseResult.channels.slice(0, 10), // Return first 10 for preview
      totalChannels: parseResult.totalChannels,
      errors: parseResult.errors,
    })
  } catch (error) {
    console.error("Parse API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
