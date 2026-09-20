import { createFileRoute, notFound, useRouter } from "@tanstack/react-router"
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import { useState } from "react"
import { Anchor, Badge, BackgroundImage, Box, Container, Grid, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core"
import { gameQueryOptions, userGameQueryOptions, gameScreenshotsQueryOptions, similarGamesQueryOptions } from "../../features/games/api/games"
import type { GameDetail } from "../../features/games/api/schemas"
import { listsQueryOptions } from "../../features/lists/api/lists"
import { GamepadIcon, SparkleIcon } from "../../features/shared/icons"
import SectionHeading from "../../features/shared/section_heading"
import routeProtector from "../../lib/route_protector"
import { BackButton } from "../../features/shared/back_pill"
import GameCard from "../../features/games/components/game_card"
import { toGameCardProps } from "../../features/games/utils/game_card_props"
import { useUserLibrary } from "../../features/games/hooks/useUserLibrary"
import MetacriticBadge from "../../features/shared/metacritic_badge"
import GameActions from "../../features/games/components/game_actions"
import GameDescriptionModal from "../../features/games/components/game_description_modal"
import ScreenshotStrip, { ScreenshotStack } from "../../features/games/components/screenshot_strip"
import ScreenshotGalleryModal from "../../features/games/components/screenshot_gallery_modal"
import AddToListModal from "../../features/lists/components/add_to_list_modal"

export const Route = createFileRoute("/games/$id")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: async ({ context: { queryClient }, params }) => {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id <= 0) throw notFound()
    await Promise.all([
      queryClient.ensureQueryData(gameQueryOptions(id)),
      queryClient.ensureQueryData(userGameQueryOptions(id)),
      queryClient.ensureQueryData(listsQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const id = Number(Route.useParams().id)
  const router = useRouter()
  const qc = useQueryClient()

  const { data: game } = useSuspenseQuery(gameQueryOptions(id))
  const { data: userGame } = useSuspenseQuery(userGameQueryOptions(id))
  const { data: myLists } = useSuspenseQuery(listsQueryOptions())
  const { data: screenshots } = useQuery(gameScreenshotsQueryOptions(id))

  const [listsOpen, { open: openLists, close: closeLists }] = useDisclosure(false)
  const [descriptionOpen, { open: openDescription, close: closeDescription }] = useDisclosure(false)
  const [galleryOpen, { open: openGalleryModal, close: closeGallery }] = useDisclosure(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const openGallery = (i: number) => { setGalleryIndex(i); openGalleryModal() }
  const goBack = () => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/games", search: { page: 1, page_size: 20 } }))

  const gamePayload = {
    game_id: game.id,
    name: game.name,
    released: game.released,
    genres: game.genres,
    metacritic: game.metacritic,
    background_image: game.background_image,
  }

  const screenshotsList = screenshots?.results ?? []
  const baseImages = [game.background_image_additional, game.background_image]
    .filter(Boolean)
    .map((img, i) => ({ id: -(i + 1), image: img! }))
  const allScreenshots = [...baseImages, ...screenshotsList]

  const inLists = userGame.lists ?? []

  return (
    <Box>
      <Box pos="relative" h={{ base: 220, sm: 340 }}>
        <BackgroundImage src={game.background_image_additional || game.background_image || ""} pos="absolute" inset={0}>
          <Box
            pos="absolute"
            inset={0}
            bg="linear-gradient(to bottom, rgba(10,15,31,.4) 0%, rgba(10,15,31,.8) 55%, var(--mantine-color-dark-7) 100%)"
          />
        </BackgroundImage>
      </Box>

      <Container size={1440} px={{ base: "md", sm: "xl" }}>
        <BackButton onClick={goBack}>Back</BackButton>

        <Grid mt="xl" gap={{ base: 16, sm: 36 }} align="flex-start">
          <Grid.Col span={{ base: 12, sm: 3.5 }}>
            {game.background_image ? (
              <BackgroundImage src={game.background_image} bdrs="lg" h={{ base: 360, sm: "auto" }} style={{ aspectRatio: "3/4", ...coverShadow }}>
                <Box pos="absolute" inset={0} bg="repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px)" />
              </BackgroundImage>
            ) : (
              <Box
                bdrs="lg"
                h={{ base: 360, sm: "auto" }}
                c="dark.3"
                display="grid"
                bg="linear-gradient(160deg, var(--mantine-color-dark-5) 0%, var(--mantine-color-dark-7) 120%)"
                style={{ aspectRatio: "3/4", placeItems: "center", ...coverShadow }}
              >
                <GamepadIcon size={64} />
              </Box>
            )}
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 8.5 }}>
            <Stack gap="md" pt={8} miw={0}>
              <Group gap={7} wrap="wrap">
                {game.genres.map((g) => (
                  <Badge key={g.id} variant="light" color="violet" radius="xl">{g.name}</Badge>
                ))}
              </Group>

              <Title order={1} fz={{ base: 28, sm: 44 }} lh={1.02} style={{ letterSpacing: -1.4, textWrap: "balance" }}>
                {game.name}
              </Title>

              <Text c="dark.1" fz={15}>
                {game.developers?.[0]?.name ?? ""} · {game.released?.slice(0, 4)}
              </Text>

              <Group gap={7} wrap="wrap">
                {game.platforms.map((p) => (
                  <Badge key={p.platform.id} variant="default" radius="xl" fz="xs">{p.platform.name}</Badge>
                ))}
              </Group>

              {allScreenshots.length > 0 && <ScreenshotStack screenshots={allScreenshots} onOpen={() => openGallery(0)} />}

              <GameScores metacritic={game.metacritic} communityScore={game.playra_community_score} />

              <GameActions
                gameId={id}
                gamePayload={gamePayload}
                ratingsList={myLists.find((l) => l.type === "ratings")}
                inWishlist={userGame.in_wishlist}
                rating={userGame.rating ?? 0}
                inLists={inLists}
                onAddToList={openLists}
              />

              {game.description_raw && (
                <Box>
                  <Text c="dark.1" fz="sm" lh={1.7} lineClamp={3}>{game.description_raw}</Text>
                  <Anchor component="button" type="button" fz={13} fw={500} c="violet.4" pt={6} onClick={openDescription}>
                    Read more
                  </Anchor>
                </Box>
              )}
            </Stack>
          </Grid.Col>
        </Grid>

        {allScreenshots.length > 0 && (
          <ScreenshotStrip
            gameName={game.name}
            screenshots={allScreenshots}
            totalCount={screenshots ? screenshots.count + baseImages.length : undefined}
            onOpen={openGallery}
          />
        )}

        <SimilarGames game={game} />
      </Container>

      <GameDescriptionModal game={game} opened={descriptionOpen} onClose={closeDescription} />

      {listsOpen && (
        <AddToListModal
          opened
          gameId={id}
          gameName={game.name}
          gamePayload={gamePayload}
          lists={myLists.filter((l) => l.type === "custom")}
          inListIds={inLists.map((l) => l.id)}
          onClose={closeLists}
          onRefresh={() => {
            qc.invalidateQueries(userGameQueryOptions(id))
            qc.invalidateQueries({ queryKey: ["lists"] })
          }}
        />
      )}

      {allScreenshots.length > 0 && (
        <ScreenshotGalleryModal
          opened={galleryOpen}
          onClose={closeGallery}
          screenshots={allScreenshots}
          initialIndex={galleryIndex}
          gameName={game.name}
        />
      )}
    </Box>
  )
}

const coverShadow = { boxShadow: "0 24px 60px -20px rgba(0,0,0,.8), inset 0 0 0 1px rgba(255,255,255,0.14)" }

function SimilarGames({ game }: { game: GameDetail }) {
  const { data: similar = [] } = useQuery(similarGamesQueryOptions(game.id, game))
  const { wishlistedIds, userRatings } = useUserLibrary()

  if (similar.length === 0) return null

  return (
    <Box mt={44} mb={60}>
      <SectionHeading icon={<SparkleIcon size={18} />}>Similar games</SectionHeading>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
        {similar.map((g) => (
          <GameCard
            key={g.id}
            {...toGameCardProps(g)}
            inWishlist={wishlistedIds.has(g.id)}
            userScore={userRatings.get(g.id) ?? null}
          />
        ))}
      </SimpleGrid>
    </Box>
  )
}

type Props = {
  metacritic: number | null
  communityScore: number | null | undefined
}

function GameScores({ metacritic, communityScore }: Props) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const hasScore = communityScore != null

  return (
    <Group gap={0} align="center" wrap="nowrap" w={{ base: '100%', sm: 'auto' }}>
      <Group gap={isMobile ? 8 : 12} align="center" pr={{ base: 'md', sm: 'lg' }} flex={{ base: 1, sm: 'none' }}>
        <MetacriticBadge score={metacritic} size={isMobile ? 40 : 54} />
        <Stack gap={1}>
          <Text fw={600} fz={{ base: 'xs', sm: 'sm' }}>Metacritic</Text>
          <Text c="dark.2" fz="xs">Critic score</Text>
        </Stack>
      </Group>

      <Box w={1} h={32} bg="rgba(255,255,255,0.1)" style={{ flexShrink: 0 }} />

      <Group gap={isMobile ? 8 : 12} align="center" pl={{ base: 'md', sm: 'lg' }} flex={{ base: 1, sm: 'none' }}>
        <Box
          ff="monospace"
          fw={600}
          fz={{ base: 15, sm: 19 }}
          px={{ base: 12, sm: 16 }}
          py={{ base: 6, sm: 8 }}
          bdrs={999}
          c={hasScore ? '#7CC8E3' : 'dark.3'}
          bg={hasScore ? 'color-mix(in oklab, #7CC8E3 14%, rgba(10,15,31,0.72))' : 'rgba(10,15,31,0.55)'}
          bd={hasScore ? '1px solid color-mix(in oklab, #7CC8E3 50%, transparent)' : '1px solid rgba(255,255,255,0.12)'}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(6px)' }}
        >
          {hasScore ? communityScore.toFixed(1) : '—'}
        </Box>
        <Stack gap={1}>
          <Text fw={600} fz={{ base: 'xs', sm: 'sm' }}>User score</Text>
          <Text c="dark.2" fz="xs">Playra</Text>
        </Stack>
      </Group>
    </Group>
  )
}
