export function generateDeviceKey(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomStr}`.toUpperCase()
}

export function getDeviceKey(): string {
  if (typeof window === "undefined") return ""

  let deviceKey = localStorage.getItem("deviceKey")
  if (!deviceKey) {
    deviceKey = generateDeviceKey()
    localStorage.setItem("deviceKey", deviceKey)
  }
  return deviceKey
}

export function clearDeviceKey(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("deviceKey")
  }
}
