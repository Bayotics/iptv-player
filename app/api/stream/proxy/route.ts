import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    console.log(" Proxying stream request for:", url)

    // Fetch the stream from the IPTV provider with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "*/*",
          Connection: "keep-alive",
        },
        redirect: "follow",
        signal: controller.signal,
        // @ts-ignore - Next.js specific
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(" Proxy fetch failed:", response.status, response.statusText)
        return NextResponse.json(
          {
            error: `Failed to fetch stream: ${response.statusText}`,
            status: response.status,
            url: url,
          },
          { status: response.status },
        )
      }

      const contentType = response.headers.get("content-type") || "application/octet-stream"
      console.log(" Stream content-type:", contentType)

      // If it's an HLS manifest, rewrite the URLs to go through our proxy
      if (
        contentType.includes("application/vnd.apple.mpegurl") ||
        contentType.includes("application/x-mpegURL") ||
        url.includes(".m3u8")
      ) {
        const text = await response.text()
        console.log(" Rewriting HLS manifest URLs")

        // Rewrite relative URLs in the manifest to absolute URLs through our proxy
        const baseUrl = new URL(url)
        const rewrittenManifest = text
          .split("\n")
          .map((line) => {
            // Skip comments and empty lines
            if (line.startsWith("#") || line.trim() === "") {
              return line
            }

            // If it's a relative URL, convert to absolute and proxy it
            if (!line.startsWith("http://") && !line.startsWith("https://")) {
              const absoluteUrl = new URL(line, baseUrl).toString()
              const proxyUrl = `/api/stream/proxy?url=${encodeURIComponent(absoluteUrl)}`
              return proxyUrl
            }

            // If it's already absolute, proxy it
            const proxyUrl = `/api/stream/proxy?url=${encodeURIComponent(line)}`
            return proxyUrl
          })
          .join("\n")

        return new NextResponse(rewrittenManifest, {
          headers: {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })
      }

      // For video segments and other content, stream it directly
      const arrayBuffer = await response.arrayBuffer()

      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Cache-Control": "public, max-age=3600",
        },
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      // Log detailed error information
      console.error(" Fetch error details:", {
        error: fetchError,
        message: fetchError instanceof Error ? fetchError.message : "Unknown error",
        name: fetchError instanceof Error ? fetchError.name : "Unknown",
        url: url,
      })

      // Check if it's a timeout
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout - stream took too long to respond", url: url },
          { status: 504 },
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error(" Proxy error:", {
      error: error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to proxy stream",
        details:
          "The server could not fetch the stream. This may be due to network restrictions or the stream provider blocking server requests.",
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  })
}
