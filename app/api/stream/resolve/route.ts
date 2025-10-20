import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("[v0] Resolving stream URL:", url)

    // Fetch the URL and follow redirects
    const response = await fetch(url, {
      method: "HEAD", // Use HEAD to avoid downloading the entire stream
      redirect: "follow", // Follow redirects automatically
    })

    // Get the final URL after redirects
    const resolvedUrl = response.url

    console.log("[v0] Resolved URL:", resolvedUrl)
    console.log("[v0] Response status:", response.status)
    console.log("[v0] Content-Type:", response.headers.get("content-type"))

    return NextResponse.json({
      originalUrl: url,
      resolvedUrl: resolvedUrl,
      status: response.status,
      contentType: response.headers.get("content-type"),
    })
  } catch (error) {
    console.error("[v0] Error resolving stream URL:", error)
    return NextResponse.json(
      {
        error: "Failed to resolve stream URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
