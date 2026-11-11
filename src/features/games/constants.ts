export const SORT_OPTIONS: { group: string; items: { value: string; label: string }[] }[] = [
  {
    group: "Popularity",
    items: [{ value: "-total_rating_count", label: "Most popular" }],
  },
  {
    group: "Rating",
    items: [
      { value: "-aggregated_rating", label: "Highest rated" },
      { value: "aggregated_rating", label: "Lowest rated" },
    ],
  },
  {
    group: "Release date",
    items: [
      { value: "-first_release_date", label: "Newest first" },
      { value: "first_release_date", label: "Oldest first" },
    ],
  },
  {
    group: "Name",
    items: [
      { value: "name", label: "A–Z" },
      { value: "-name", label: "Z–A" },
    ],
  },
]

// IGDB platform ids -- curated shortlist for the filter sidebar.
export const PLATFORMS = [
  { label: "PC", id: "6" },
  { label: "PS5", id: "167" },
  { label: "Xbox", id: "169" },
  { label: "Switch", id: "130" },
  { label: "Mobile", id: "34" },
]

// IGDB's platform list mixes ~35 recognizable platforms in with ~180 obscure
// ones (vintage mainframes, dev boards, defunct mobile OSes) with no clean
// field to tell them apart -- platform_type lumps PC in with Windows Mobile
// and BlackBerry OS. "Show all platforms" expands into this curated allowlist
// instead of IGDB's raw list, rather than surfacing all of it.
export const EXPANDED_PLATFORM_IDS = new Set([
  // PC
  "6", "14", "3",
  // Mobile
  "34", "39",
  // Nintendo
  "18", "19", "58", "4", "21", "5", "41", "130", "508", "33", "22", "24", "20", "37", "87",
  // Sony
  "7", "8", "9", "48", "167", "38", "46", "165", "390",
  // Microsoft
  "11", "12", "49", "169",
  // Sega
  "64", "29", "32", "23", "35", "78", "30",
  // Atari
  "59", "60", "62",
  // VR
  "384", "385", "386", "471",
])

export type Status = "all" | "released" | "upcoming"
