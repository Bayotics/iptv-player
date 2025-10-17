"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface PlaylistContentFormProps {
  onSubmit: (content: string, name: string) => Promise<void>
  isLoading: boolean
}

export function PlaylistContentForm({ onSubmit, isLoading }: PlaylistContentFormProps) {
  const [content, setContent] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(content, name)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content-name">Playlist Name</Label>
        <Input
          id="content-name"
          placeholder="My IPTV Playlist"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="playlist-content">M3U Content</Label>
        <Textarea
          id="playlist-content"
          placeholder="#EXTM3U&#10;#EXTINF:-1,Channel Name&#10;http://example.com/stream.m3u8"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isLoading}
          rows={10}
          className="font-mono text-sm"
        />
        <p className="text-sm text-muted-foreground">Paste your M3U playlist content directly</p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Add Playlist"
        )}
      </Button>
    </form>
  )
}
