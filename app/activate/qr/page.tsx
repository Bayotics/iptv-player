"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, AlertCircle, CheckCircle2 } from "lucide-react"

function QRActivateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")

  const [playlistName, setPlaylistName] = useState("")
  const [playlistUrl, setPlaylistUrl] = useState("")
  const [playlistContent, setPlaylistContent] = useState("")
  const [inputMethod, setInputMethod] = useState<"url" | "content">("url")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid QR code session")
    }
  }, [sessionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Parse the playlist
      const parseResponse = await fetch("/api/playlists/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputMethod === "url" ? playlistUrl : undefined,
          content: inputMethod === "content" ? playlistContent : undefined,
        }),
      })

      const parseData = await parseResponse.json()

      if (!parseResponse.ok) {
        throw new Error(parseData.error || "Failed to parse playlist")
      }

      // Save the playlist
      const saveResponse = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playlistName || "Mobile Playlist",
          url: inputMethod === "url" ? playlistUrl : undefined,
          content: inputMethod === "content" ? playlistContent : undefined,
          deviceKey: `qr-device-${sessionId}`,
        }),
      })

      const saveData = await saveResponse.json()

      if (!saveResponse.ok) {
        throw new Error(saveData.error || "Failed to save playlist")
      }

      // Notify the desktop session
      if (typeof window !== "undefined") {
        localStorage.setItem(`qr-activated-${sessionId}`, "true")
        localStorage.setItem(`qr-playlist-${sessionId}`, JSON.stringify(saveData.playlist))
      }

      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        window.close()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <CardTitle>Invalid QR Code</CardTitle>
            <CardDescription>This QR code session is invalid or has expired</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <CardTitle>Playlist Added!</CardTitle>
            <CardDescription>Your playlist has been successfully added to your device</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">You can close this window now</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Smartphone className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Add Your Playlist</CardTitle>
          <CardDescription>Enter your playlist details to activate your device</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Playlist Name</Label>
              <Input
                id="name"
                placeholder="My IPTV Playlist"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Input Method</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={inputMethod === "url" ? "default" : "outline"}
                  onClick={() => setInputMethod("url")}
                  className="flex-1"
                >
                  URL
                </Button>
                <Button
                  type="button"
                  variant={inputMethod === "content" ? "default" : "outline"}
                  onClick={() => setInputMethod("content")}
                  className="flex-1"
                >
                  Paste M3U
                </Button>
              </div>
            </div>

            {inputMethod === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="url">Playlist URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/playlist.m3u"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="content">M3U Content</Label>
                <Textarea
                  id="content"
                  placeholder="#EXTM3U&#10;#EXTINF:-1,Channel Name&#10;http://example.com/stream.m3u8"
                  value={playlistContent}
                  onChange={(e) => setPlaylistContent(e.target.value)}
                  rows={8}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding Playlist..." : "Add Playlist"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function QRActivatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRActivateContent />
    </Suspense>
  )
}
