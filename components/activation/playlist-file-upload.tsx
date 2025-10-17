"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, FileText } from "lucide-react"

interface PlaylistFileUploadProps {
  onSubmit: (content: string, name: string) => Promise<void>
  isLoading: boolean
}

export function PlaylistFileUpload({ onSubmit, isLoading }: PlaylistFileUploadProps) {
  const [name, setName] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileContent, setFileContent] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setFileContent(content)
        if (!name) {
          setName(file.name.replace(/\.(m3u|m3u8)$/i, ""))
        }
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (fileContent) {
      await onSubmit(fileContent, name)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-name">Playlist Name</Label>
        <Input
          id="file-name"
          placeholder="My IPTV Playlist"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload M3U File</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {fileName || "Choose File"}
          </Button>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".m3u,.m3u8"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
        </div>
        {fileName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || !fileContent}>
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
