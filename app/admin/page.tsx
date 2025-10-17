"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Database, Activity, Users, Trash2, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Playlist {
  id: string
  name: string
  url?: string
  channelCount: number
  deviceKey: string
  createdAt: string
}

interface Device {
  id: string
  deviceKey: string
  playlistCount: number
  lastActive: string
}

interface Log {
  id: string
  type: "info" | "error" | "warning"
  message: string
  timestamp: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState({
    totalPlaylists: 0,
    totalChannels: 0,
    totalDevices: 0,
    activeDevices: 0,
  })

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth === "true") {
      setIsAuthenticated(true)
      loadAdminData()
    }
  }, [])

  const handleLogin = () => {
    // Simple password check (in production, use proper authentication)
    if (password === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuth", "true")
      loadAdminData()
    } else {
      alert("Invalid password")
    }
  }

  const loadAdminData = async () => {
    try {
      // Load playlists
      const playlistsRes = await fetch("/api/admin/playlists")
      const playlistsData = await playlistsRes.json()
      setPlaylists(playlistsData.playlists || [])

      // Load devices
      const devicesRes = await fetch("/api/admin/devices")
      const devicesData = await devicesRes.json()
      setDevices(devicesData.devices || [])

      // Load logs
      const logsRes = await fetch("/api/admin/logs")
      const logsData = await logsRes.json()
      setLogs(logsData.logs || [])

      // Calculate stats
      const totalChannels = playlistsData.playlists?.reduce((sum: number, p: Playlist) => sum + p.channelCount, 0) || 0
      setStats({
        totalPlaylists: playlistsData.playlists?.length || 0,
        totalChannels,
        totalDevices: devicesData.devices?.length || 0,
        activeDevices:
          devicesData.devices?.filter((d: Device) => {
            const lastActive = new Date(d.lastActive)
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            return lastActive > dayAgo
          }).length || 0,
      })
    } catch (err) {
      console.error("[v0] Failed to load admin data:", err)
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadAdminData()
      }
    } catch (err) {
      console.error("[v0] Failed to delete playlist:", err)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription>Enter password to access admin features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <p className="text-xs text-muted-foreground">Default password: admin123</p>
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage playlists, devices, and view system logs</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("adminAuth")
              setIsAuthenticated(false)
            }}
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Playlists</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlaylists}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChannels}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDevices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDevices}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="playlists" className="w-full">
          <TabsList>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="playlists" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Playlists</CardTitle>
                <CardDescription>View and manage all playlists in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {playlists.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <p className="text-muted-foreground">No playlists found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Channels</TableHead>
                        <TableHead>Device Key</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playlists.map((playlist) => (
                        <TableRow key={playlist.id}>
                          <TableCell className="font-medium">{playlist.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{playlist.url || "N/A"}</TableCell>
                          <TableCell>{playlist.channelCount}</TableCell>
                          <TableCell className="font-mono text-xs">{playlist.deviceKey.slice(0, 8)}...</TableCell>
                          <TableCell>{new Date(playlist.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePlaylist(playlist.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Devices</CardTitle>
                <CardDescription>View all devices that have accessed the system</CardDescription>
              </CardHeader>
              <CardContent>
                {devices.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <p className="text-muted-foreground">No devices found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device Key</TableHead>
                        <TableHead>Playlists</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map((device) => {
                        const lastActive = new Date(device.lastActive)
                        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                        const isActive = lastActive > dayAgo

                        return (
                          <TableRow key={device.id}>
                            <TableCell className="font-mono">{device.deviceKey}</TableCell>
                            <TableCell>{device.playlistCount}</TableCell>
                            <TableCell>{lastActive.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={isActive ? "default" : "secondary"}>
                                {isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>View recent system activity and errors</CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <p className="text-muted-foreground">No logs found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <Alert key={log.id} variant={log.type === "error" ? "destructive" : "default"}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={log.type === "error" ? "destructive" : "default"}>{log.type}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <AlertDescription className="mt-2">{log.message}</AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
