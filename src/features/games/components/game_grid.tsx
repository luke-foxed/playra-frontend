import { Box, SimpleGrid, Skeleton, AspectRatio, Group, Text, Button, Pagination } from "@mantine/core"
import GameCard from "./game_card"
import type { GamesResponse } from "../api/schemas"

function SkeletonCard() {
  return (
    <Box bg="dark.6" style={{ borderRadius: "var(--mantine-radius-md)", overflow: "hidden" }}>
      <AspectRatio ratio={3 / 4}>
        <Skeleton h="100%" radius={0} />
      </AspectRatio>
      <Box px={12} py={10}>
        <Skeleton h={10} w="35%" mb={8} radius="sm" />
        <Skeleton h={13} w="85%" mb={10} radius="sm" />
        <Group gap={4}>
          <Skeleton h={18} w={32} radius={5} />
          <Skeleton h={18} w={28} radius={5} />
          <Skeleton h={18} w={24} radius={5} />
        </Group>
      </Box>
    </Box>
  )
}

type Props = {
  games: GamesResponse | undefined
  isFetching: boolean
  isLoading: boolean
  totalPages: number
  currentPage: number
  wishlistedIds?: Set<number>
  onPageChange: (page: number) => void
  onClearAll: () => void
}

export default function GameGrid({ games, isFetching, isLoading, totalPages, currentPage, wishlistedIds, onPageChange, onClearAll }: Props) {
  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </SimpleGrid>
    )
  }

  if (!games || games.results.length === 0) {
    return (
      <Box ta="center" py={64}>
        <Text fw={600} fz="md" c="dark.1" mb={6}>No games match those filters</Text>
        <Text c="dark.2" fz="sm">Try removing a filter or searching something else.</Text>
        <Button variant="light" size="sm" mt="md" onClick={onClearAll}>Reset everything</Button>
      </Box>
    )
  }

  return (
    <>
      <Box style={{ opacity: isFetching ? 0.5 : 1, transition: "opacity 0.2s" }}>
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5 }} spacing="md">
          {games.results.map((g) => (
            <GameCard
              key={g.id}
              id={g.id}
              name={g.name}
              imageUrl={g.background_image}
              metacritic={g.metacritic}
              released={g.released}
              genres={g.genres.map((x) => x.name)}
              platforms={g.platforms.map((x) => x.platform.slug)}
              communityScore={g.playra_community_score}
              inWishlist={wishlistedIds?.has(g.id) ?? false}
            />
          ))}
        </SimpleGrid>
      </Box>

      {totalPages > 1 && (
        <Group justify="center" mt={40}>
          <Pagination
            value={currentPage}
            onChange={onPageChange}
            total={totalPages}
            siblings={1}
            boundaries={1}
            size="sm"
          />
        </Group>
      )}
    </>
  )
}
