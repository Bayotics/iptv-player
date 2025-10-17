"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface DeviceKeyFormProps {
  onSubmit: (deviceKey: string) => Promise<void>
  isLoading: boolean
}

export function DeviceKeyForm({ onSubmit, isLoading }: DeviceKeyFormProps) {
  const [deviceKey, setDeviceKey] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(deviceKey)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="device-key">Device Key / Activation Code</Label>
        <Input
          id="device-key"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          value={deviceKey}
          onChange={(e) => setDeviceKey(e.target.value.toUpperCase())}
          required
          disabled={isLoading}
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">Enter your device activation code provided by your IPTV service</p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Activating...
          </>
        ) : (
          "Activate Device"
        )}
      </Button>
    </form>
  )
}
