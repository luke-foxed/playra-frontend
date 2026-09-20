import { useNavigate } from "@tanstack/react-router"
import dayjs from "dayjs"
import type { GetGamesParams } from "../api/schemas"
import type { Status } from "../constants"

const OLDEST = "1970-01-01"
const FAR_FUTURE = "2030-12-31"

export function useGamesFilters(search: GetGamesParams) {
  const navigate = useNavigate({ from: "/games/" })
  const patch = (partial: Partial<GetGamesParams>) =>
    navigate({ search: (prev) => ({ ...prev, ...partial, page: 1 }) })

  const today = dayjs().format("YYYY-MM-DD")
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD")

  const minScore = search.metacritic ? parseInt(search.metacritic.split(",")[0]) : 0
  const currentGenres = search.genres ? search.genres.split(",") : []
  const currentPlatforms = search.parent_platforms ? search.parent_platforms.split(",") : []

  const isReleasedPreset = search.dates === `${OLDEST},${today}`
  const isUpcomingPreset = search.dates === `${tomorrow},${FAR_FUTURE}`
  const currentStatus: Status = isReleasedPreset ? "released" : isUpcomingPreset ? "upcoming" : "all"
  const hasCustomDateRange = !!search.dates && !isReleasedPreset && !isUpcomingPreset
  const [dateFrom = "", dateTo = ""] = hasCustomDateRange ? (search.dates ?? "").split(",").map((d) => d.slice(0, 4)) : []

  const activeFilterCount =
    (currentStatus !== "all" ? 1 : 0) +
    currentGenres.length +
    currentPlatforms.length +
    (minScore > 0 ? 1 : 0) +
    (hasCustomDateRange ? 1 : 0)

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const sidebarProps = {
    currentStatus,
    currentGenres,
    currentPlatforms,
    minScore,
    dateFrom,
    dateTo,
    onStatusChange: (status: Status) =>
      patch({ dates: status === "released" ? `${OLDEST},${today}` : status === "upcoming" ? `${tomorrow},${FAR_FUTURE}` : undefined }),
    onGenreToggle: (slug: string) => {
      const next = toggle(currentGenres, slug)
      patch({ genres: next.length ? next.join(",") : undefined })
    },
    onPlatformToggle: (id: string) => {
      const next = toggle(currentPlatforms, id)
      patch({ parent_platforms: next.length ? next.join(",") : undefined })
    },
    onMinScoreChange: (val: number) => patch({ metacritic: val ? `${val},100` : undefined }),
    onDateRangeChange: (from: string, to: string) =>
      patch({ dates: from || to ? `${from ? `${from}-01-01` : OLDEST},${to ? `${to}-12-31` : FAR_FUTURE}` : undefined }),
  }

  return {
    sidebarProps,
    activeFilterCount,
    hasFilters: activeFilterCount > 0 || !!search.search,
    setSearch: (term: string | undefined) => patch({ search: term }),
    setOrdering: (ordering: GetGamesParams["ordering"]) => patch({ ordering }),
    setPage: (page: number) => navigate({ search: (prev) => ({ ...prev, page }) }),
    clearAll: () => navigate({ search: { page: 1, page_size: search.page_size ?? 20 } }),
  }
}
