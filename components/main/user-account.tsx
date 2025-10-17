"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Smartphone, Key, Save } from "lucide-react"
import { getDeviceKey } from "@/lib/device-utils"

export function UserAccount() {
  const [deviceKey, setDeviceKey] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    // Load device key
    const key = getDeviceKey()
    setDeviceKey(key)

    // Load user data from localStorage (if exists)
    const savedUsername = localStorage.getItem("username") || ""
    const savedEmail = localStorage.getItem("email") || ""
    setUsername(savedUsername)
    setEmail(savedEmail)
  }, [])

  const handleSaveProfile = () => {
    localStorage.setItem("username", username)
    localStorage.setItem("email", email)
    alert("Profile saved successfully!")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>User Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button onClick={handleSaveProfile} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4" />
              Device Information
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceKey">Device Key</Label>
              <div className="flex gap-2">
                <Input id="deviceKey" value={deviceKey} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(deviceKey)
                    alert("Device key copied to clipboard!")
                  }}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This unique key identifies your device. Use it to restore your playlists on other devices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
