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

export type Status = "all" | "released" | "upcoming"
