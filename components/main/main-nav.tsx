"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tv2, Film, Clapperboard, User, Menu, Settings, RefreshCw, LogOut, List } from "lucide-react"

type NavSection = "live" | "movies" | "series" | "account"

interface MainNavProps {
  activeSection: NavSection
  onSectionChange: (section: NavSection) => void
  onChangePlaylist: () => void
  onSettings: () => void
  onReload: () => void
  onExit: () => void
}

export function MainNav({
  activeSection,
  onSectionChange,
  onChangePlaylist,
  onSettings,
  onReload,
  onExit,
}: MainNavProps) {
  const navItems = [
    { id: "live" as NavSection, label: "Live TV", icon: Tv2 },
    { id: "movies" as NavSection, label: "Movies", icon: Film },
    { id: "series" as NavSection, label: "Series", icon: Clapperboard },
    { id: "account" as NavSection, label: "Account", icon: User },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <Tv2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">IPTV Player</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                onClick={() => onSectionChange(item.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-2 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onChangePlaylist}>
                <List className="mr-2 h-4 w-4" />
                Change Playlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReload}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExit} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Exit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.id} onClick={() => onSectionChange(item.id)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onChangePlaylist}>
                <List className="mr-2 h-4 w-4" />
                Change Playlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReload}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExit} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Exit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
