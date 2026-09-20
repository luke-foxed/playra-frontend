import type { ListGame, ListType } from '../api/schemas'

export type SortOrder = 'added-desc' | 'added-asc' | 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc'

export const defaultSortFor = (type: ListType): SortOrder => (type === 'ratings' ? 'rating-desc' : 'added-desc')

export function sortOptionsFor(type: ListType): { value: SortOrder; label: string }[] {
  return [
    { value: 'added-desc', label: 'Date added: Newest' },
    { value: 'added-asc', label: 'Date added: Oldest' },
    ...(type === 'ratings'
      ? [
          { value: 'rating-desc' as const, label: 'Rating: High → Low' },
          { value: 'rating-asc' as const, label: 'Rating: Low → High' },
        ]
      : []),
    { value: 'name-asc', label: 'Name: A–Z' },
    { value: 'name-desc', label: 'Name: Z–A' },
  ]
}

const addedAt = (g: ListGame) => (g.added_at ? Date.parse(g.added_at) : 0)
// unrated games always sort last (ratings are 0–10)
const ratingOr = (g: ListGame, fallback: number) => g.user_rating ?? fallback

const comparators: Record<SortOrder, (a: ListGame, b: ListGame) => number> = {
  'added-desc': (a, b) => addedAt(b) - addedAt(a),
  'added-asc': (a, b) => addedAt(a) - addedAt(b),
  'rating-desc': (a, b) => ratingOr(b, -1) - ratingOr(a, -1),
  'rating-asc': (a, b) => ratingOr(a, 11) - ratingOr(b, 11),
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
}

export function filterAndSortGames(games: ListGame[], query: string, order: SortOrder): ListGame[] {
  const q = query.trim().toLowerCase()
  const filtered = q ? games.filter((g) => g.name.toLowerCase().includes(q)) : [...games]
  return filtered.sort(comparators[order])
}
