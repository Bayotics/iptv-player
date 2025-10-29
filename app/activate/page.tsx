"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlaylistUrlForm } from "@/components/activation/playlist-url-form"
import { PlaylistContentForm } from "@/components/activation/playlist-content-form"
import { PlaylistFileUpload } from "@/components/activation/playlist-file-upload"
import { DeviceKeyForm } from "@/components/activation/device-key-form"
import { PreviewModal } from "@/components/activation/preview-modal"
import { getDeviceKey } from "@/lib/device-utils"
import { MOCK_M3U_CONTENT } from "@/lib/mock-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QRCodeCard } from "@/components/activation/qr-code-card"
import Image from "next/image"

export default function ActivatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [pendingPlaylist, setPendingPlaylist] = useState<{
    name: string
    url?: string
    content?: string
  } | null>(null)

  useEffect(() => {
    // Check if user already has a playlist
    const hasPlaylist = localStorage.getItem("hasPlaylist")
    if (hasPlaylist === "true") {
      router.push("/main")
    }
  }, [router])

  const handlePreview = async (url?: string, content?: string) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/playlists/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, content }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse playlist")
      }

      setPreviewData(data)
      setShowPreview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlSubmit = async (url: string, name: string) => {
    setPendingPlaylist({ name, url })
    await handlePreview(url)
  }

  const handleContentSubmit = async (content: string, name: string) => {
    setPendingPlaylist({ name, content })
    await handlePreview(undefined, content)
  }

  const handleConfirmPlaylist = async () => {
    if (!pendingPlaylist) return

    setIsLoading(true)
    setError("")

    try {
      const deviceKey = getDeviceKey()
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pendingPlaylist,
          deviceKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save playlist")
      }

      // Save to localStorage
      localStorage.setItem("hasPlaylist", "true")
      localStorage.setItem("activePlaylistId", data.playlist.id)

      // Navigate to main page
      router.push("/main")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setShowPreview(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeviceKeySubmit = async (deviceKey: string) => {
    setIsLoading(true)
    setError("")

    try {
      // In a real app, this would validate the device key with the backend
      // For now, we'll simulate a successful activation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      localStorage.setItem("deviceKey", deviceKey)
      localStorage.setItem("hasPlaylist", "true")

      router.push("/main")
    } catch (err) {
      setError("Invalid device key. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseMockData = async () => {
    setPendingPlaylist({ name: "Demo Playlist", content: MOCK_M3U_CONTENT })
    await handlePreview(undefined, MOCK_M3U_CONTENT)
  }

  const handleQRActivated = () => {
    // Redirect to main page after QR activation
    setTimeout(() => {
      localStorage.setItem("hasPlaylist", "true")
      router.push("/main")
    }, 2000)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/starry-night-bg.jpg)" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <Card className="w-full border-white/10 bg-black/20 backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Supreme IPTV"
                  width={140}
                  height={140}
                  className="h-full w-full object-contain"
                />
              </div>
              <CardTitle className="text-3xl">Welcome to Supreme IPTV</CardTitle>
              <CardDescription className="text-base">Add your first playlist to get started</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="content">Paste</TabsTrigger>
                  <TabsTrigger value="file">Upload</TabsTrigger>
                  <TabsTrigger value="key">Device Key</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="mt-4">
                  <PlaylistUrlForm onSubmit={handleUrlSubmit} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="content" className="mt-4">
                  <PlaylistContentForm onSubmit={handleContentSubmit} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="file" className="mt-4">
                  <PlaylistFileUpload onSubmit={handleContentSubmit} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="key" className="mt-4">
                  <DeviceKeyForm onSubmit={handleDeviceKeySubmit} isLoading={isLoading} />
                </TabsContent>
              </Tabs>

              <div className="mt-6 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={handleUseMockData}
                  className="w-full bg-transparent"
                  disabled={isLoading}
                >
                  Try Demo Playlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 lg:max-w-md">
          <QRCodeCard onActivated={handleQRActivated} />
        </div>
      </div>

      {previewData && (
        <PreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmPlaylist}
          channels={previewData.channels}
          totalChannels={previewData.totalChannels}
          errors={previewData.errors || []}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
