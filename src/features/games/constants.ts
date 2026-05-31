export const SORT_OPTIONS: { group: string; items: { value: string; label: string }[] }[] = [
  {
    group: "Popularity",
    items: [{ value: "-rating", label: "Most popular" }],
  },
  {
    group: "Critic score",
    items: [
      { value: "-metacritic", label: "Highest rated" },
      { value: "metacritic", label: "Lowest rated" },
    ],
  },
  {
    group: "Release date",
    items: [
      { value: "-released", label: "Newest first" },
      { value: "released", label: "Oldest first" },
    ],
  },
  {
    group: "Activity",
    items: [
      { value: "-added", label: "Recently added" },
      { value: "-updated", label: "Recently updated" },
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

export const GENRES = [
  { label: "Action", slug: "action" },
  { label: "Adventure", slug: "adventure" },
  { label: "Arcade", slug: "arcade" },
  { label: "Cards", slug: "card-games" },
  { label: "Cozy", slug: "casual" },
  { label: "Horror", slug: "horror" },
  { label: "Metroidvania", slug: "indie" },
  { label: "Platformer", slug: "platformer" },
  { label: "Puzzle", slug: "puzzle" },
  { label: "RPG", slug: "role-playing-games" },
  { label: "Racing", slug: "racing" },
  { label: "Roguelike", slug: "roguelike" },
  { label: "Sim", slug: "simulation" },
  { label: "Strategy", slug: "strategy" },
  { label: "Survival", slug: "survival" },
]

export const PLATFORMS = [
  { label: "Mobile", id: "4" },
  { label: "PC", id: "1" },
  { label: "PS5", id: "2" },
  { label: "Switch", id: "7" },
  { label: "Xbox", id: "3" },
]

export type Status = "all" | "released" | "upcoming"

export const chipBase: React.CSSProperties = {
  borderRadius: 20,
  fontSize: 12,
  fontFamily: "'Sora', system-ui, sans-serif",
  cursor: "pointer",
  transition: "all 0.15s ease",
  letterSpacing: "-0.1px",
  lineHeight: 1,
  whiteSpace: "nowrap",
}
