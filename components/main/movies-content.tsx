"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Play, Grid3x3, List, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Movie {
  id: string
  name: string
  logo?: string
  group?: string
  streamUrl: string
}

export function MoviesContent() {
  const router = useRouter()
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetchAllMovies()
  }, [])

  useEffect(() => {
    filterMovies()
  }, [searchQuery, selectedGroup, allMovies])

  useEffect(() => {
    paginateMovies()
  }, [currentPage, filteredMovies])

  const fetchAllMovies = async () => {
    try {
      setIsLoading(true)
      const activePlaylistId = localStorage.getItem("activePlaylistId")

      if (!activePlaylistId) {
        setError("No active playlist found. Please add a playlist first.")
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/channels?type=movie&playlistId=${activePlaylistId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch movies")
      }

      const sortedMovies = (data.channels || []).sort((a: Movie, b: Movie) => a.name.localeCompare(b.name))
      setAllMovies(sortedMovies)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movies")
    } finally {
      setIsLoading(false)
    }
  }

  const filterMovies = () => {
    let filtered = allMovies

    if (selectedGroup !== "all") {
      filtered = filtered.filter((m) => m.group === selectedGroup)
    }

    if (searchQuery) {
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredMovies(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const paginateMovies = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setDisplayedMovies(filteredMovies.slice(startIndex, endIndex))
  }

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const groups = ["all", ...Array.from(new Set(allMovies.map((m) => m.group).filter(Boolean)))]

  const handlePlayMovie = (movie: Movie) => {
    router.push(`/player?channelId=${movie.id}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mb-4 text-lg font-semibold">Loading all movies...</div>
            <p className="text-sm text-muted-foreground">This may take a moment for large playlists</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3]" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search all movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredMovies.length === allMovies.length
            ? `${allMovies.length.toLocaleString()} total movies loaded`
            : `${filteredMovies.length.toLocaleString()} of ${allMovies.length.toLocaleString()} movies`}
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <Badge
            key={group}
            variant={selectedGroup === group ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedGroup(group)}
          >
            {group === "all" ? "All Movies" : group}
          </Badge>
        ))}
      </div>

      {filteredMovies.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">No movies found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {displayedMovies.map((movie) => (
            <Card
              key={movie.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
              onClick={() => handlePlayMovie(movie)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-[2/3] bg-muted">
                  {movie.logo ? (
                    <img
                      src={movie.logo || "/placeholder.svg"}
                      alt={movie.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="truncate font-semibold text-sm">{movie.name}</h3>
                  {movie.group && <p className="text-xs text-muted-foreground">{movie.group}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {displayedMovies.map((movie) => (
            <Card
              key={movie.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handlePlayMovie(movie)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-20 w-14 items-center justify-center rounded bg-muted">
                  {movie.logo ? (
                    <img
                      src={movie.logo || "/placeholder.svg"}
                      alt={movie.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Play className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{movie.name}</h3>
                  {movie.group && <p className="text-sm text-muted-foreground">{movie.group}</p>}
                </div>
                <Play className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button onClick={goToPreviousPage} disabled={currentPage === 1} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span className="px-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button onClick={goToNextPage} disabled={currentPage === totalPages} variant="outline">
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
