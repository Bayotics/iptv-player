"use client"

import type React from "react"

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
  SkipForward,
  SkipBack,
} from "lucide-react"
import Hls from "hls.js"

interface Channel {
  id: string
  name: string
  streamUrl: string
  logo?: string
  type: "live" | "movie" | "series"
}

export function VideoPlayer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const channelId = searchParams.get("channelId")

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const progressBarRef = useRef<HTMLDivElement>(null)

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
  const [showPlayOverlay, setShowPlayOverlay] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [qualities, setQualities] = useState<string[]>([])
  const [currentQuality, setCurrentQuality] = useState<string>("auto")
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsMobile(mobile)
      console.log("[v0] Mobile device detected:", mobile)
    }
    checkMobile()
  }, [])

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

      console.log("[v0] Channel fetched:", data.channel)
      setChannel(data.channel)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channel")
      setIsLoading(false)
    }
  }

  const initializePlayer = async () => {
    const video = videoRef.current
    if (!video || !channel) return

    const streamUrl = channel.streamUrl
    console.log("[v0] Original stream URL:", streamUrl)
    console.log("[v0] Is mobile:", isMobile)

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const canPlayNativeHLS = video.canPlayType("application/vnd.apple.mpegurl")

    if (isIOS || canPlayNativeHLS) {
      console.log("[v0] Using native HLS support (iOS/Safari)")
      setupNativeHLS(streamUrl)
      return
    }

    let urlToUse = `/api/stream/proxy?url=${encodeURIComponent(streamUrl)}`
    let useProxy = true

    try {
      const proxyTest = await fetch(urlToUse, { method: "HEAD" })
      if (!proxyTest.ok) {
        console.log("[v0] Proxy not available, using direct URL")
        urlToUse = streamUrl
        useProxy = false
      } else {
        console.log("[v0] Using proxy URL:", urlToUse)
      }
    } catch (err) {
      console.log("[v0] Proxy test failed, using direct URL:", err)
      urlToUse = streamUrl
      useProxy = false
    }

    if (Hls.isSupported()) {
      console.log("[v0] Attempting HLS.js playback")
      setupHLSjs(urlToUse, streamUrl, useProxy)
    } else {
      console.log("[v0] HLS.js not supported, using direct video playback")
      tryDirectPlayback(streamUrl)
    }

    setupVideoEventListeners()
  }

  const setupNativeHLS = (streamUrl: string) => {
    const video = videoRef.current
    if (!video) return

    video.src = streamUrl
    video.playsInline = true
    video.preload = "auto"

    const handleLoadedMetadata = () => {
      console.log("[v0] Native HLS: metadata loaded")
      setIsLoading(false)
      video.play().catch((err) => {
        console.log("[v0] Autoplay prevented:", err)
        if (!isMobile) {
          setShowPlayOverlay(true)
        }
      })
    }

    const handleError = (e: Event) => {
      console.error("[v0] Native HLS error:", video.error)
      setError("Failed to load stream")
      setIsLoading(false)
      setShowPlayOverlay(true)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("error", handleError)
    video.load()
  }

  const setupHLSjs = (urlToUse: string, streamUrl: string, useProxy: boolean) => {
    const video = videoRef.current
    if (!video) return

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      xhrSetup: (xhr, url) => {
        xhr.withCredentials = false
      },
    })

    hls.loadSource(urlToUse)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      console.log("[v0] HLS manifest parsed successfully, levels:", data.levels.length)
      const availableQualities = data.levels.map((level, index) => `${level.height}p`)
      setQualities(["auto", ...availableQualities])
      setIsLoading(false)

      video.play().catch((err) => {
        console.log("[v0] Autoplay prevented:", err)
        if (!isMobile) {
          setShowPlayOverlay(true)
        }
      })
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("[v0] HLS error:", data.type, data.details, data.fatal)

      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log("[v0] Network error, attempting to recover...")
            if (useProxy && data.details === "manifestLoadError") {
              console.log("[v0] Proxy failed, switching to direct URL")
              hls.destroy()
              hlsRef.current = null
              tryDirectPlayback(streamUrl)
            } else {
              setTimeout(() => hls.startLoad(), 1000)
            }
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("[v0] Media error, attempting to recover...")
            hls.recoverMediaError()
            break
          default:
            console.error("[v0] Fatal HLS error, trying direct video playback")
            hls.destroy()
            hlsRef.current = null
            tryDirectPlayback(streamUrl)
            break
        }
      }
    })

    hlsRef.current = hls
  }

  const setupVideoEventListeners = () => {
    const video = videoRef.current
    if (!video) return

    video.addEventListener("play", () => {
      console.log("[v0] Video playing")
      setIsPlaying(true)
      setShowPlayOverlay(false)
    })
    video.addEventListener("pause", () => {
      console.log("[v0] Video paused")
      setIsPlaying(false)
    })
    video.addEventListener("timeupdate", () => setCurrentTime(video.currentTime))
    video.addEventListener("durationchange", () => setDuration(video.duration))
    video.addEventListener("volumechange", () => {
      setVolume(video.volume * 100)
      setIsMuted(video.muted)
    })
    video.addEventListener("waiting", () => {
      console.log("[v0] Video buffering...")
    })
    video.addEventListener("canplay", () => {
      console.log("[v0] Video can play")
      setIsLoading(false)
    })
  }

  const tryDirectPlayback = (streamUrl: string) => {
    const video = videoRef.current
    if (!video) return

    console.log("[v0] Setting up direct video playback with URL:", streamUrl)
    video.src = streamUrl
    video.crossOrigin = "anonymous"
    video.playsInline = true
    video.autoplay = true
    video.muted = false

    const handleLoadedMetadata = () => {
      console.log("[v0] Direct playback: metadata loaded")
      setIsLoading(false)

      video.play().catch((err) => {
        console.log("[v0] Autoplay prevented, trying muted:", err)
        video.muted = true
        video.play().catch((err2) => {
          console.log("[v0] Muted autoplay also failed:", err2)
          if (!isMobile) {
            setShowPlayOverlay(true)
          }
        })
      })
    }

    const handleError = (e: Event) => {
      console.error("[v0] Direct playback error:", video.error)
      const errorCode = video.error?.code
      const errorMessage = video.error?.message || "Unable to play stream"

      if (errorCode === 4) {
        setError("Stream format not supported. This stream may require a different player.")
      } else if (errorCode === 2) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError(errorMessage)
      }
      setIsLoading(false)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("error", handleError)
    video.load()
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((err) => {
        console.error("[v0] Play failed:", err)
        if (!isMobile) {
          setShowPlayOverlay(true)
        }
      })
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
    if (videoRef.current && channel?.type !== "live") {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || channel?.type === "live") return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
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

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const isControlsArea = target.closest('[data-controls="true"]')

    if (!isControlsArea && showControls) {
      setShowControls(false)
    } else if (!showControls) {
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
  }

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
        case "arrowleft":
          e.preventDefault()
          skipBackward()
          break
        case "arrowright":
          e.preventDefault()
          skipForward()
          break
        case "arrowup":
          e.preventDefault()
          handleVolumeChange([Math.min(volume + 10, 100)])
          break
        case "arrowdown":
          e.preventDefault()
          handleVolumeChange([Math.max(volume - 10, 0)])
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, volume])

  const skipForward = () => {
    if (videoRef.current && channel?.type !== "live") {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration)
    }
  }

  const skipBackward = () => {
    if (videoRef.current && channel?.type !== "live") {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0)
    }
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "00:00"
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isOnDemand = channel?.type === "movie" || channel?.type === "series"

  if (!channel && !isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">{error || "Channel not found"}</p>
        <Button onClick={() => router.push("/main")} variant="default">
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
      onClick={handleContainerClick}
    >
      <video ref={videoRef} className="h-full w-full" onClick={togglePlay} playsInline preload="auto" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading stream...</div>
        </div>
      )}

      {showPlayOverlay && !isPlaying && !error && !isMobile && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm">
          <Button size="lg" onClick={togglePlay} className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90">
            <Play className="h-10 w-10 fill-current" />
          </Button>
          <p className="text-sm text-white">Tap to play</p>
        </div>
      )}

      {error && !isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
          <p className="text-center text-destructive px-4">{error}</p>
          <Button onClick={() => router.push("/main")} variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Main
          </Button>
        </div>
      )}

      <div
        data-controls="true"
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/80 transition-opacity duration-300 ${
          showControls && !showPlayOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/main")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center text-white">
            <h2 className="text-lg font-semibold truncate px-4">{channel?.name}</h2>
          </div>
          <div className="w-10" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {isOnDemand && duration > 0 && (
            <div
              ref={progressBarRef}
              className="flex items-center gap-3 cursor-pointer"
              onClick={handleProgressBarClick}
            >
              <span className="text-xs text-white font-medium min-w-[45px]">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1 cursor-pointer"
              />
              <span className="text-xs text-white font-medium min-w-[45px]">{formatTime(duration)}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              {isOnDemand && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      skipBackward()
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      skipForward()
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </>
              )}

              {!isMobile && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMute()
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {!isOnDemand && duration > 0 && (
                <span className="text-xs text-white font-medium ml-2">{formatTime(currentTime)}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {isOnDemand && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Playback Speed</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <DropdownMenuItem
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={playbackSpeed === speed ? "bg-accent" : ""}
                        >
                          {speed}x {speed === 1 && "(Normal)"}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  {qualities.length > 0 && (
                    <>
                      {isOnDemand && <div className="my-1 h-px bg-border" />}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Quality</div>
                      {qualities.map((quality) => (
                        <DropdownMenuItem
                          key={quality}
                          onClick={() => handleQualityChange(quality)}
                          className={currentQuality === quality ? "bg-accent" : ""}
                        >
                          {quality}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePiP()
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <PictureInPicture className="h-5 w-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFullscreen()
                }}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
