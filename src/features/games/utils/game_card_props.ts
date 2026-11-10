import dayjs from 'dayjs'
import type { Game } from '../api/schemas'

export const toGameCardProps = (g: Game) => ({
  id: g.id,
  name: g.name,
  imageUrl: g.cover_url,
  criticRating: g.aggregated_rating,
  releaseYear: g.first_release_date != null ? dayjs.unix(g.first_release_date).year() : null,
  isUpcoming: g.first_release_date != null && dayjs.unix(g.first_release_date).isAfter(dayjs(), 'day'),
  genres: g.genres.map((x) => x.name),
  platforms: g.platforms.map((x) => x.abbreviation ?? x.name),
  communityScore: g.playra_community_score,
})
