import type { Game } from '../api/schemas'

export const toGameCardProps = (g: Game) => ({
  id: g.id,
  name: g.name,
  imageUrl: g.background_image,
  metacritic: g.metacritic,
  released: g.released,
  genres: g.genres.map((x) => x.name),
  platforms: g.platforms.map((x) => x.platform.slug),
  communityScore: g.playra_community_score,
})
