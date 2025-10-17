"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ArrowLeft,
  PictureInPicture,
  Subtitles,
} from "lucide-react"
import Hls from "hls.js"

interface Channel {
  id: string
  name: string
  streamUrl: string
  logo?: string
}

export function VideoPlayer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const channelId = searchParams.get("channelId")

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const [channel, setChannel] = useState<Channel | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [qualities, setQualities] = useState<string[]>([])
  const [currentQuality, setCurrentQuality] = useState<string>("auto")
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)

  useEffect(() => {
    if (!channelId) {
      router.push("/main")
      return
    }
    fetchChannel()
  }, [channelId])

  useEffect(() => {
    if (channel && videoRef.current) {
      initializePlayer()
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [channel])

  const fetchChannel = async () => {
    try {
      const response = await fetch(`/api/channels/${channelId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch channel")
      }

      setChannel(data.channel)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channel")
      setIsLoading(false)
    }
  }

  const initializePlayer = () => {
    const video = videoRef.current
    if (!video || !channel) return

    const streamUrl = channel.streamUrl

    // Check if HLS is supported
    if (streamUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        })

        hls.loadSource(streamUrl)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log("[v0] HLS manifest parsed, levels:", data.levels.length)
          const availableQualities = data.levels.map((level, index) => `${level.height}p`)
          setQualities(["auto", ...availableQualities])
          setIsLoading(false)
          video.play()
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("[v0] HLS error:", data)
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Network error - trying to recover")
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media error - trying to recover")
                hls.recoverMediaError()
                break
              default:
                setError("Fatal error - cannot play stream")
                hls.destroy()
                break
            }
          }
        })

        hlsRef.current = hls
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = streamUrl
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false)
          video.play()
        })
      } else {
        setError("HLS is not supported in this browser")
        setIsLoading(false)
      }
    } else {
      // Direct stream URL
      video.src = streamUrl
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false)
        video.play()
      })
    }

    // Video event listeners
    video.addEventListener("play", () => setIsPlaying(true))
    video.addEventListener("pause", () => setIsPlaying(false))
    video.addEventListener("timeupdate", () => setCurrentTime(video.currentTime))
    video.addEventListener("durationchange", () => setDuration(video.duration))
    video.addEventListener("volumechange", () => {
      setVolume(video.volume * 100)
      setIsMuted(video.muted)
    })
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0]
      videoRef.current.volume = newVolume / 100
      setVolume(newVolume)
      if (newVolume === 0) {
        videoRef.current.muted = true
      } else if (isMuted) {
        videoRef.current.muted = false
      }
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const togglePiP = async () => {
    if (!videoRef.current) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (err) {
      console.error("[v0] PiP error:", err)
    }
  }

  const handleQualityChange = (quality: string) => {
    if (!hlsRef.current) return

    const hls = hlsRef.current
    const qualityIndex = qualities.indexOf(quality) - 1 // -1 because "auto" is first

    if (quality === "auto") {
      hls.currentLevel = -1 // Auto quality
    } else {
      hls.currentLevel = qualityIndex
    }

    setCurrentQuality(quality)
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.push("/main")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Main
        </Button>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen w-full items-center justify-center bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video ref={videoRef} className="h-full w-full" onClick={togglePlay} crossOrigin="anonymous" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top Bar */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/main")} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-white">
            <h2 className="text-lg font-semibold">{channel?.name}</h2>
          </div>
          <div className="w-10" />
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
          {/* Progress Bar */}
          {duration > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white">{formatTime(currentTime)}</span>
              <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleSeek} className="flex-1" />
              <span className="text-xs text-white">{formatTime(duration)}</span>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white">
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-24" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {qualities.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {qualities.map((quality) => (
                      <DropdownMenuItem
                        key={quality}
                        onClick={() => handleQualityChange(quality)}
                        className={currentQuality === quality ? "bg-accent" : ""}
                      >
                        {quality}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                className="text-white"
              >
                <Subtitles className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={togglePiP} className="text-white">
                <PictureInPicture className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
