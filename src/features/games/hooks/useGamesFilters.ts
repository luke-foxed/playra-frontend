import { useNavigate } from "@tanstack/react-router"
import dayjs from "dayjs"
import type { GetGamesParams } from "../api/schemas"
import type { Status } from "../constants"

export function useGamesFilters(search: GetGamesParams) {
  const navigate = useNavigate({ from: "/games/" })
  const patch = (partial: Partial<GetGamesParams>) =>
    navigate({ search: (prev) => ({ ...prev, ...partial, page: 1 }) })

  const currentYear = dayjs().year()

  const minScore = search.rating_min ?? 0
  const currentGenres = search.genres ? search.genres.split(",") : []
  const currentPlatforms = search.platforms ? search.platforms.split(",") : []

  // IGDB's filters only go down to year granularity (no day-level dates), so these
  // presets are coarser than RAWG's day-precision "released"/"upcoming": a game
  // releasing later this year still counts as "released" here.
  const isReleasedPreset = search.release_year_max === currentYear && search.release_year_min == null
  const isUpcomingPreset = search.release_year_min === currentYear && search.release_year_max == null
  const currentStatus: Status = isReleasedPreset ? "released" : isUpcomingPreset ? "upcoming" : "all"
  const hasCustomDateRange = !isReleasedPreset && !isUpcomingPreset && (search.release_year_min != null || search.release_year_max != null)
  const dateFrom = hasCustomDateRange && search.release_year_min != null ? String(search.release_year_min) : ""
  const dateTo = hasCustomDateRange && search.release_year_max != null ? String(search.release_year_max) : ""

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
      patch({
        release_year_min: status === "upcoming" ? currentYear : undefined,
        release_year_max: status === "released" ? currentYear : undefined,
      }),
    onGenreToggle: (id: string) => {
      const next = toggle(currentGenres, id)
      patch({ genres: next.length ? next.join(",") : undefined })
    },
    onPlatformToggle: (id: string) => {
      const next = toggle(currentPlatforms, id)
      patch({ platforms: next.length ? next.join(",") : undefined })
    },
    onMinScoreChange: (val: number) => patch({ rating_min: val || undefined }),
    onDateRangeChange: (from: string, to: string) =>
      patch({
        release_year_min: from ? parseInt(from) : undefined,
        release_year_max: to ? parseInt(to) : undefined,
      }),
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
