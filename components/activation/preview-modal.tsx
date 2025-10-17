"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, XCircle } from "lucide-react"

interface Channel {
  name: string
  tvgLogo?: string
  groupTitle?: string
  type: string
}

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  channels: Channel[]
  totalChannels: number
  errors: string[]
  isLoading: boolean
}

export function PreviewModal({
  open,
  onClose,
  onConfirm,
  channels,
  totalChannels,
  errors,
  isLoading,
}: PreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Playlist Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Channels</p>
              <p className="text-2xl font-bold">{totalChannels}</p>
            </div>
            {errors.length > 0 ? (
              <XCircle className="h-8 w-8 text-destructive" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            )}
          </div>

          {errors.length > 0 && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="mb-2 font-semibold text-destructive">Parsing Warnings:</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-2 font-semibold">Sample Channels (First 10):</p>
            <ScrollArea className="h-64 rounded-lg border">
              <div className="space-y-2 p-4">
                {channels.map((channel, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    {channel.tvgLogo ? (
                      <img
                        src={channel.tvgLogo || "/placeholder.svg"}
                        alt={channel.name}
                        className="h-10 w-10 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                        <span className="text-xs font-semibold">{channel.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {channel.groupTitle || "Uncategorized"} • {channel.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1" disabled={isLoading}>
              {isLoading ? "Saving..." : "Confirm & Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
