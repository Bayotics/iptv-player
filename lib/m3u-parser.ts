export interface ParsedChannel {
  name: string
  tvgId?: string
  tvgLogo?: string
  groupTitle?: string
  streamUrl: string
  type: "live" | "movie" | "series"
  metadata?: {
    duration?: string
    rating?: string
    description?: string
    year?: string
    genre?: string[]
  }
}

export interface ParseResult {
  success: boolean
  channels: ParsedChannel[]
  errors: string[]
  totalChannels: number
}

export function parseM3U(content: string): ParseResult {
  const result: ParseResult = {
    success: false,
    channels: [],
    errors: [],
    totalChannels: 0,
  }

  try {
    // Remove BOM if present
    content = content.replace(/^\uFEFF/, "")

    // Check if it's a valid M3U file
    if (!content.trim().startsWith("#EXTM3U")) {
      result.errors.push("Invalid M3U format: Missing #EXTM3U header")
      return result
    }

    const lines = content.split("\n").map((line) => line.trim())
    let currentChannel: Partial<ParsedChannel> = {}

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("#EXTINF:")) {
        // Parse channel info
        const infoMatch = line.match(/#EXTINF:(-?\d+)(.*)/)
        if (infoMatch) {
          const attributes = infoMatch[2]

          // Extract tvg-id
          const tvgIdMatch = attributes.match(/tvg-id="([^"]*)"/)
          if (tvgIdMatch) currentChannel.tvgId = tvgIdMatch[1]

          // Extract tvg-logo
          const tvgLogoMatch = attributes.match(/tvg-logo="([^"]*)"/)
          if (tvgLogoMatch) currentChannel.tvgLogo = tvgLogoMatch[1]

          // Extract group-title
          const groupMatch = attributes.match(/group-title="([^"]*)"/)
          if (groupMatch) currentChannel.groupTitle = groupMatch[1]

          // Extract channel name (after last comma)
          const nameMatch = attributes.match(/,(.*)$/)
          if (nameMatch) {
            currentChannel.name = nameMatch[1].trim()
          }

          // Determine type based on group title
          const groupLower = currentChannel.groupTitle?.toLowerCase() || ""
          if (groupLower.includes("movie")) {
            currentChannel.type = "movie"
          } else if (groupLower.includes("series") || groupLower.includes("tv show")) {
            currentChannel.type = "series"
          } else {
            currentChannel.type = "live"
          }
        }
      } else if (line && !line.startsWith("#") && currentChannel.name) {
        // This is the stream URL
        currentChannel.streamUrl = line

        // Add the channel to results
        if (currentChannel.name && currentChannel.streamUrl) {
          result.channels.push(currentChannel as ParsedChannel)
          result.totalChannels++
        }

        // Reset for next channel
        currentChannel = {}
      }
    }

    result.success = result.channels.length > 0
    if (result.channels.length === 0) {
      result.errors.push("No valid channels found in playlist")
    }
  } catch (error) {
    result.errors.push(`Parse error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }

  return result
}

export async function validatePlaylistUrl(url: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Basic URL validation
    const urlObj = new URL(url)
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS protocol" }
    }

    // Check if URL ends with .m3u or .m3u8
    const validExtensions = [".m3u", ".m3u8"]
    const hasValidExtension = validExtensions.some((ext) => url.toLowerCase().includes(ext))

    // Check for common M3U query parameters used by IPTV providers
    const searchParams = urlObj.searchParams
    const hasM3UParam =
      searchParams.get("type")?.toLowerCase().includes("m3u") ||
      searchParams.get("output")?.toLowerCase().includes("m3u") ||
      searchParams.get("format")?.toLowerCase().includes("m3u")

    // Accept URL if it has valid extension OR M3U-related query parameters
    if (!hasValidExtension && !hasM3UParam) {
      return {
        valid: false,
        error: "URL should point to an M3U or M3U8 file, or include M3U-related parameters",
      }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: "Invalid URL format" }
  }
}
