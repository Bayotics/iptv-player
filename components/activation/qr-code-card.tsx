"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Smartphone, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface QRCodeCardProps {
  onActivated?: () => void
}

export function QRCodeCard({ onActivated }: QRCodeCardProps) {
  const [qrCode, setQrCode] = useState<string>("")
  const [sessionId, setSessionId] = useState<string>("")
  const [isActivated, setIsActivated] = useState(false)

  useEffect(() => {
    // Generate unique session ID
    const id = `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setSessionId(id)

    // Generate QR code URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const qrUrl = `${baseUrl}/activate/qr?session=${id}`

    // Generate QR code as data URL
    generateQRCode(qrUrl)

    // Poll for activation status
    const interval = setInterval(async () => {
      const activated = localStorage.getItem(`qr-activated-${id}`)
      if (activated === "true") {
        setIsActivated(true)
        clearInterval(interval)
        onActivated?.()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [onActivated])

  const generateQRCode = async (url: string) => {
    try {
      // Using qrcode library to generate QR code
      const QRCode = (await import("qrcode")).default
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      setQrCode(qrDataUrl)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {isActivated ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <QrCode className="h-8 w-8 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl">Scan to Activate</CardTitle>
        <CardDescription>Use your mobile device to add a playlist</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {isActivated ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-center text-lg font-medium text-green-500">Playlist Added Successfully!</p>
            <p className="text-center text-sm text-muted-foreground">Redirecting to main page...</p>
          </div>
        ) : (
          <>
            {qrCode && (
              <div className="rounded-lg border-4 border-border bg-white p-4">
                <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="h-64 w-64" />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                Session: {sessionId.slice(0, 12)}...
              </Badge>
            </div>

            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Scan with your phone camera</span>
              </div>
              <p className="text-xs text-muted-foreground">Open the link on your mobile device to add your playlist</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
