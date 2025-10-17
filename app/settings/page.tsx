"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Shield, Globe, Layout, Play, List, Trash2, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Playlist {
  id: string
  name: string
  url?: string
  channelCount: number
  isActive: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [parentalControlEnabled, setParentalControlEnabled] = useState(false)
  const [parentalPin, setParentalPin] = useState("")
  const [language, setLanguage] = useState("en")
  const [theme, setTheme] = useState("dark")
  const [autoplay, setAutoplay] = useState(true)
  const [defaultQuality, setDefaultQuality] = useState("auto")
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    loadSettings()
    loadPlaylists()
  }, [])

  const loadSettings = () => {
    const settings = {
      parentalControlEnabled: localStorage.getItem("parentalControlEnabled") === "true",
      parentalPin: localStorage.getItem("parentalPin") || "",
      language: localStorage.getItem("language") || "en",
      theme: localStorage.getItem("theme") || "dark",
      autoplay: localStorage.getItem("autoplay") !== "false",
      defaultQuality: localStorage.getItem("defaultQuality") || "auto",
    }

    setParentalControlEnabled(settings.parentalControlEnabled)
    setParentalPin(settings.parentalPin)
    setLanguage(settings.language)
    setTheme(settings.theme)
    setAutoplay(settings.autoplay)
    setDefaultQuality(settings.defaultQuality)
  }

  const loadPlaylists = async () => {
    try {
      const response = await fetch("/api/playlists")
      const data = await response.json()

      if (response.ok) {
        const activePlaylistId = localStorage.getItem("activePlaylistId")
        const playlistsWithActive = (data.playlists || []).map((p: Playlist) => ({
          ...p,
          isActive: p.id === activePlaylistId,
        }))
        setPlaylists(playlistsWithActive)
      }
    } catch (err) {
      console.error("[v0] Failed to load playlists:", err)
    }
  }

  const saveSettings = () => {
    localStorage.setItem("parentalControlEnabled", parentalControlEnabled.toString())
    localStorage.setItem("parentalPin", parentalPin)
    localStorage.setItem("language", language)
    localStorage.setItem("theme", theme)
    localStorage.setItem("autoplay", autoplay.toString())
    localStorage.setItem("defaultQuality", defaultQuality)

    setSaveMessage("Settings saved successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPlaylists(playlists.filter((p) => p.id !== playlistId))
        setSaveMessage("Playlist deleted successfully!")
        setTimeout(() => setSaveMessage(""), 3000)
      }
    } catch (err) {
      console.error("[v0] Failed to delete playlist:", err)
    }
  }

  const handleSetActivePlaylist = async (playlistId: string) => {
    localStorage.setItem("activePlaylistId", playlistId)
    setPlaylists(playlists.map((p) => ({ ...p, isActive: p.id === playlistId })))
    setSaveMessage("Active playlist changed!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your IPTV player preferences</p>
          </div>
        </div>

        {saveMessage && (
          <Alert>
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="parental">Parental</TabsTrigger>
            <TabsTrigger value="playback">Playback</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>Language & Region</CardTitle>
                </div>
                <CardDescription>Set your preferred language and regional settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>Customize the look and feel of the app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parental" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Parental Controls</CardTitle>
                </div>
                <CardDescription>Protect content with a PIN code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Parental Controls</Label>
                    <p className="text-sm text-muted-foreground">Require PIN to access restricted content</p>
                  </div>
                  <Switch checked={parentalControlEnabled} onCheckedChange={setParentalControlEnabled} />
                </div>

                {parentalControlEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="pin">Parental PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="Enter 4-digit PIN"
                      value={parentalPin}
                      onChange={(e) => setParentalPin(e.target.value)}
                      maxLength={4}
                    />
                    <p className="text-xs text-muted-foreground">This PIN will be required to access adult content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playback" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  <CardTitle>Playback Settings</CardTitle>
                </div>
                <CardDescription>Configure video playback preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autoplay</Label>
                    <p className="text-sm text-muted-foreground">Automatically start playing when opening a channel</p>
                  </div>
                  <Switch checked={autoplay} onCheckedChange={setAutoplay} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="quality">Default Quality</Label>
                  <Select value={defaultQuality} onValueChange={setDefaultQuality}>
                    <SelectTrigger id="quality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="360p">360p</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Auto quality adjusts based on your connection speed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playlists" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    <CardTitle>Manage Playlists</CardTitle>
                  </div>
                  <Button onClick={() => router.push("/activate")} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Playlist
                  </Button>
                </div>
                <CardDescription>View and manage your IPTV playlists</CardDescription>
              </CardHeader>
              <CardContent>
                {playlists.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <p className="text-muted-foreground">No playlists found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{playlist.name}</h3>
                          <p className="text-sm text-muted-foreground">{playlist.channelCount} channels</p>
                          {playlist.url && <p className="text-xs text-muted-foreground">{playlist.url}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {playlist.isActive ? (
                            <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                              Active
                            </span>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleSetActivePlaylist(playlist.id)}>
                              Set Active
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={saveSettings} size="lg">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
