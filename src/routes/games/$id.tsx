import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState, useEffect, useRef } from "react"
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMediaQuery, useHover, useHotkeys } from "@mantine/hooks"
import {
  Box,
  Group,
  Text,
  Title,
  Button,
  Badge,
  SimpleGrid,
  Container,
  Anchor,
  Stack,
  TextInput,
  Checkbox,
  Grid,
  BackgroundImage,
  ActionIcon,
  ScrollArea,
} from "@mantine/core"
import { Modal } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { gameQueryOptions, userGameQueryOptions, similarGamesQueryOptions, gameScreenshotsQueryOptions } from "../../features/games/api/games"
import { listsQueryOptions, addGamesToList, removeGamesFromList, createList } from "../../features/lists/api/lists"
import routeProtector from "../../lib/route_protector"
import MetacriticBadge from "../../features/shared/metacritic_badge"
import StarRating from "../../features/shared/star_rating"
import GameCard from "../../features/games/components/game_card"
import { ArrowLeftIcon, HeartIcon, PlusIcon, SparkleIcon, ListIcon, GlobeIcon, LockIcon, GamepadIcon, XIcon, PhotoIcon, ChevronLeftIcon, ChevronIcon } from "../../features/shared/icons"
import useWishlistToggle from "../../features/lists/hooks/useWishlistToggle"
import useRateGame from "../../features/lists/hooks/useRateGame"
import PlayraLoader from "../../features/shared/playra_loader"

export const Route = createFileRoute("/games/$id")({
  component: RouteComponent,
  beforeLoad: routeProtector,
  loader: async ({ context: { queryClient }, params }) => {
    const id = Number(params.id)
    await Promise.all([
      queryClient.ensureQueryData(gameQueryOptions(id)),
      queryClient.ensureQueryData(userGameQueryOptions(id)),
      queryClient.ensureQueryData(listsQueryOptions()),
    ])
  },
  pendingComponent: () => <PlayraLoader />
})

function RouteComponent() {
  const params = Route.useParams()
  const router = useRouter()
  const id = Number(params.id)
  const qc = useQueryClient()

  const { data: game } = useSuspenseQuery(gameQueryOptions(id))
  const { data: userGame } = useSuspenseQuery(userGameQueryOptions(id))
  const { data: myLists } = useSuspenseQuery(listsQueryOptions())

  const { data: similar } = useSuspenseQuery(similarGamesQueryOptions(id, game))

  const wishlist = myLists.find((l) => l.type === "wishlist")
  const ratingsList = myLists.find((l) => l.type === "ratings")
  const customLists = myLists.filter((l) => l.type !== "wishlist")

  const inWishlist = userGame.in_wishlist
  const myRating = userGame.rating ?? 0
  const inLists = userGame.lists ?? []

  const gamePayload = {
    game_id: game.id,
    name: game.name,
    released: game.released,
    genres: game.genres,
    metacritic: game.metacritic,
    background_image: game.background_image,
  }

  const { data: screenshots } = useQuery(gameScreenshotsQueryOptions(id))
  const screenshotsList = screenshots?.results ?? []
  const baseImages = [game.background_image_additional, game.background_image]
    .filter(Boolean)
    .map((img, i) => ({ id: -(i + 1), image: img! }))
  const allScreenshots = [...baseImages, ...screenshotsList]

  const { toggleWishlist, isLoading: wishlistLoading } = useWishlistToggle(id, wishlist)
  const { rateGame, isLoading: ratingLoading } = useRateGame(id, ratingsList)
  const [showLists, setShowLists] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const openGallery = (i: number) => { setGalleryIndex(i); setGalleryOpen(true) }
  const isMobile = useMediaQuery('(max-width: 48em)')
  const { hovered: backHovered, ref: backRef } = useHover<HTMLButtonElement>()

  const topCoverImage = game.background_image_additional || game.background_image

  return (
    <Box>
      <Box style={{ position: "relative", height: isMobile ? 220 : 340 }}>
        <BackgroundImage src={topCoverImage ?? ""} pos="absolute" inset="0">
          <Box
            pos="absolute"
            inset="0"
            bg="linear-gradient(to bottom, rgba(10,15,31,.4) 0%, rgba(10,15,31,.8) 55%, var(--mantine-color-dark-7) 100%)"
          />
        </BackgroundImage>
      </Box>

      <Container size={1440} px={{ base: "md", sm: "xl" }}>
        <Anchor
          ref={backRef}
          component="button"
          onClick={() => router.history.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: backHovered ? "rgba(255,255,255,0.12)" : "rgba(10,15,31,.5)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${backHovered ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 999,
            padding: "9px 15px",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--mantine-color-dark-0)",
            textDecoration: "none",
            marginTop: -20,
            position: "relative",
            zIndex: 10,
            transform: backHovered ? "translateY(-1px)" : "none",
            transition: "background 0.15s, border-color 0.15s, transform 0.15s",
            cursor: "pointer",
          }}>
          <ArrowLeftIcon size={16} /> Back
        </Anchor>

        <Grid mt="xl" gap={isMobile ? 16 : 36} align="flex-start">
          {/* Cover */}

          <Grid.Col span={{ base: 12, sm: 3.5 }}>
            {game.background_image ? (
              <BackgroundImage
                src={game.background_image}
                style={{
                  ...(isMobile ? { height: 360 } : { aspectRatio: "3/4" }),
                  boxShadow: "0 24px 60px -20px rgba(0,0,0,.8), inset 0 0 0 1px rgba(255,255,255,0.14)",
                }}
                bdrs="lg">
                <Box pos="absolute" inset={0} bg="repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px)" />
              </BackgroundImage>
            ) : (
              <Box
                style={{
                  ...(isMobile ? { height: 360 } : { aspectRatio: "3/4" }),
                  borderRadius: "var(--mantine-radius-lg)",
                  background: "linear-gradient(160deg, var(--mantine-color-dark-5) 0%, var(--mantine-color-dark-7) 120%)",
                  boxShadow: "0 24px 60px -20px rgba(0,0,0,.8), inset 0 0 0 1px rgba(255,255,255,0.10)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--mantine-color-dark-3)",
                }}>
                <GamepadIcon size={64} />
              </Box>
            )}
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 8.5 }}>
            {/* Info */}
            <Stack>
              <Stack gap="md" style={{ flex: 1, minWidth: 0, paddingTop: 8 }} pt={8}>
                <Group gap={7} wrap="wrap">
                  {game.genres.map((g) => (
                    <Badge key={g.id} variant="light" color="violet" radius="xl">
                      {g.name}
                    </Badge>
                  ))}
                </Group>

                <Title order={1} fz={{ base: 28, sm: 44 }} style={{ lineHeight: 1.02, letterSpacing: -1.4, textWrap: "balance" }}>
                  {game.name}
                </Title>

                <Text c="dark.1" fz={15}>
                  {game.developers?.[0]?.name ?? ""} · {game.released?.slice(0, 4)}
                </Text>

                <Group gap={7} wrap="wrap">
                  {game.platforms.map((p) => (
                    <Badge key={p.platform.id} variant="default" radius="xl" fz="xs">
                      {p.platform.name}
                    </Badge>
                  ))}
                </Group>

                {allScreenshots.length > 0 && (
                  <Group
                    gap={0}
                    style={{ cursor: "pointer", width: "fit-content" }}
                    onClick={() => openGallery(0)}
                  >
                    {allScreenshots.slice(0, 4).map((shot, i) => (
                      <Box
                        key={shot.id}
                        style={{
                          width: 40,
                          height: 27,
                          borderRadius: 5,
                          overflow: "hidden",
                          marginLeft: i === 0 ? 0 : -10,
                          border: "2px solid var(--mantine-color-dark-7)",
                          zIndex: 4 - i,
                          position: "relative",
                          transition: "transform 0.15s",
                        }}
                      >
                        <img src={shot.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </Box>
                    ))}
                    <Group gap={5} ml={10}>
                      <PhotoIcon size={13} style={{ color: "var(--mantine-color-dark-2)" }} />
                      <Text fz="xs" c="dark.2" fw={500}>
                        {allScreenshots.length} screenshot{allScreenshots.length !== 1 ? "s" : ""}
                      </Text>
                    </Group>
                  </Group>
                )}

                {/* Scores */}
                <Group gap="xl">
                  <Group gap="sm">
                    <MetacriticBadge score={game.metacritic} size={52} />
                    <Stack gap={1}>
                      <Text fw={600} fz="sm">
                        Metacritic
                      </Text>
                      <Text c="dark.2" fz="xs">
                        Critic score
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap="sm">
                    <Box
                      h={52}
                      bdrs="md"
                      ff="monospace"
                      fz="18px"
                      fw="600"
                      display="grid"
                      style={{
                        placeItems: "center",
                        minWidth: 68,
                        padding: "0 12px",
                        color: game.playra_community_score != null ? "#7CC8E3" : "var(--mantine-color-dark-3)",
                        background:
                          game.playra_community_score != null
                            ? "color-mix(in oklab, #7CC8E3 14%, transparent)"
                            : "var(--mantine-color-dark-6)",
                        boxShadow:
                          game.playra_community_score != null
                            ? "inset 0 0 0 1.5px color-mix(in oklab, #7CC8E3 45%, transparent)"
                            : "inset 0 0 0 1.5px rgba(255,255,255,0.08)",
                      }}>
                      {game.playra_community_score != null ? game.playra_community_score.toFixed(1) : "—"}
                    </Box>
                    <Stack gap={1}>
                      <Text fw={600} fz="sm">
                        User score
                      </Text>
                      <Text c="dark.2" fz="xs">
                        Playra
                      </Text>
                    </Stack>
                  </Group>
                </Group>

                {/* Actions */}
                <Stack gap="xs" style={isMobile ? {} : { flexDirection: "row", flexWrap: "wrap" }}>
                  <Button
                    color="violet"
                    variant={inWishlist ? "light" : "filled"}
                    leftSection={<HeartIcon size={17} fill={inWishlist} />}
                    loading={wishlistLoading}
                    fullWidth={isMobile}
                    onClick={() => toggleWishlist({ inWishlist, gamePayload })}>
                    {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                  </Button>
                  <Button
                    variant="outline"
                    color="gray"
                    leftSection={<PlusIcon size={17} />}
                    fullWidth={isMobile}
                    rightSection={
                      inLists.length > 0 ? (
                        <Badge size="xs" color="violet" variant="filled">
                          {inLists.length}
                        </Badge>
                      ) : undefined
                    }
                    onClick={() => setShowLists(true)}>
                    Add to list
                  </Button>
                </Stack>

                {/* Rating */}
                <Stack
                  p="20px"
                  bg="dark.6"
                  bdrs="md"
                  gap={10}
                  w={{ base: "100%", sm: "auto" }}
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}>
                  <Text fz="xs" tt="uppercase" style={{ letterSpacing: 1.4 }} c="dark.2" fw={600}>
                    {myRating ? "Your rating" : "Rate this game"}
                  </Text>
                  <Group gap="md" align="center">
                    <StarRating
                      value={myRating}
                      readonly={ratingLoading}
                      onChange={(n) => rateGame({ score: n, gamePayload })}
                      size={isMobile ? 20 : 24}
                    />
                    {myRating > 0 && (
                      <Anchor component="button" c="violet" fz="sm" onClick={() => rateGame({ score: 0, gamePayload })}>
                        Clear
                      </Anchor>
                    )}
                  </Group>
                </Stack>

                {/* In-lists chips */}
                {inLists.length > 0 && (
                  <Group gap="xs" wrap="wrap">
                    <Text fz="sm" c="dark.2">
                      On your lists:
                    </Text>
                    {inLists.map((l) => (
                      <Badge key={l.id} variant="light" color="cyan" leftSection={<ListIcon size={12} />} radius="xl">
                        {l.name}
                      </Badge>
                    ))}
                  </Group>
                )}

                {/* Description */}
                {game.description_raw && (
                  <Box>
                    <Text c="dark.1" fz="sm" style={{ lineHeight: 1.7 }} lineClamp={3}>
                      {game.description_raw}
                    </Text>
                    <button
                      type="button"
                      onClick={() => setShowDescription(true)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "6px 0 0",
                        cursor: "pointer",
                        color: "var(--mantine-color-violet-4)",
                        fontSize: 13,
                        fontWeight: 500,
                        display: "block",
                        position: "relative",
                        zIndex: 9,
                      }}>
                      Read more
                    </button>
                  </Box>
                )}
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* SCREENSHOTS */}
        {allScreenshots.length > 0 && (
          <Box mt={44}>
            <Group gap={10} mb="md" justify="space-between" align="center">
              <Group gap={10}>
                <Box style={{ color: "var(--mantine-color-violet-4)", display: "grid" }}>
                  <PhotoIcon size={18} />
                </Box>
                <Title order={2} style={{ letterSpacing: -0.6 }}>
                  Screenshots
                </Title>
                {screenshots && screenshots.count > screenshotsList.length && (
                  <Badge variant="outline" color="dark" radius="xl" size="sm">
                    {screenshots.count + baseImages.length}
                  </Badge>
                )}
              </Group>
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                leftSection={<PhotoIcon size={13} />}
                onClick={() => openGallery(0)}
              >
                View all
              </Button>
            </Group>
            <ScrollArea type="hover" scrollbarSize={4}>
              <Group gap={8} wrap="nowrap" pb={8}>
                {allScreenshots.map((shot, i) => (
                  <Box
                    key={shot.id}
                    onClick={() => openGallery(i)}
                    style={{
                      position: "relative",
                      width: isMobile ? 200 : 260,
                      aspectRatio: "16/9",
                      borderRadius: "var(--mantine-radius-md)",
                      overflow: "hidden",
                      cursor: "pointer",
                      flexShrink: 0,
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  >
                    <img
                      src={shot.image}
                      alt={`${game.name} screenshot ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <Box
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0)",
                        transition: "background 0.15s",
                      }}
                      className="screenshot-hover-overlay"
                    />
                  </Box>
                ))}
              </Group>
            </ScrollArea>
          </Box>
        )}

        {/* SIMILAR */}
        {similar.length > 0 && (
          <Box mt={44} mb={60}>
            <Group gap={10} mb="md">
              <Box style={{ color: "var(--mantine-color-violet-4)", display: "grid" }}>
                <SparkleIcon size={18} />
              </Box>
              <Title order={2} style={{ letterSpacing: -0.6 }}>
                Similar games
              </Title>
            </Group>
            <SimpleGrid cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 6 }} spacing="md">
              {similar.map((g) => (
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
                />
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Container>

      <Modal
        opened={showDescription}
        onClose={() => setShowDescription(false)}
        size="lg"
        padding={0}
        withCloseButton={false}
        styles={{ header: { display: "none" }, body: { padding: 0 }, content: { overflow: "hidden" } }}
        radius="md">
        {/* Blurred cover banner */}
        <Box
          style={{
            position: "relative",
            height: 160,
            overflow: "hidden",
            borderRadius: "var(--mantine-radius-md) var(--mantine-radius-md) 0 0",
            flexShrink: 0,
          }}>
          {game.background_image && (
            <Box
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${game.background_image})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                filter: "blur(6px) brightness(0.35)",
                transform: "scale(1.08)",
              }}
            />
          )}
          <Box
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(10,15,31,0.2) 0%, rgba(10,15,31,0.92) 100%)",
            }}
          />
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            radius="xl"
            style={{ position: "absolute", top: 12, right: 12, zIndex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowDescription(false)}>
            <XIcon size={14} />
          </ActionIcon>
          <Box style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 18px" }}>
            <Group gap={6} mb={8}>
              {game.genres.slice(0, 3).map((g) => (
                <Badge key={g.id} variant="light" color="violet" radius="xl" size="xs">
                  {g.name}
                </Badge>
              ))}
            </Group>
            <Title order={2} style={{ fontSize: 22, letterSpacing: -0.6, lineHeight: 1.1 }}>
              {game.name}
            </Title>
          </Box>
        </Box>

        {/* Content */}
        <ScrollArea.Autosize mah={420}>
          <Box p="xl" pt="lg">
            {game.description ? (
              <Box fz="sm" c="dark.1" style={{ lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: game.description }} />
            ) : (
              <Text c="dark.1" fz="sm" style={{ lineHeight: 1.8 }}>
                {game.description_raw}
              </Text>
            )}
          </Box>
        </ScrollArea.Autosize>
      </Modal>

      {showLists && (
        <AddToListModal
          gameId={id}
          gameName={game.name}
          gamePayload={gamePayload}
          customLists={customLists}
          inListIds={inLists.map((l) => l.id)}
          onClose={() => setShowLists(false)}
          onRefresh={() => {
            qc.invalidateQueries(userGameQueryOptions(id))
            qc.invalidateQueries(listsQueryOptions())
          }}
        />
      )}

      {allScreenshots.length > 0 && (
        <ScreenshotGalleryModal
          opened={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          screenshots={allScreenshots}
          initialIndex={galleryIndex}
          gameName={game.name}
        />
      )}
    </Box>
  )
}

type GamePayload = {
  game_id: number
  name: string
  released: string | null
  genres: Array<{ id: number; name: string; slug: string }>
  metacritic: number | null
  background_image: string | null
}

function AddToListModal({
  gameId,
  gameName,
  gamePayload,
  customLists,
  inListIds,
  onClose,
  onRefresh,
}: {
  gameId: number
  gameName: string
  gamePayload: GamePayload
  customLists: Array<{ id: string; name: string; type: string; is_public: boolean }>
  inListIds: string[]
  onClose: () => void
  onRefresh: () => void
}) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [pending, setPending] = useState<string | null>(null)

  const toggle = async (listId: string, isIn: boolean) => {
    setPending(listId)
    try {
      if (isIn) await removeGamesFromList(listId, [gameId])
      else await addGamesToList(listId, [gamePayload])
      onRefresh()
    } catch {
      notifications.show({ title: "Error", message: "Failed to update list", color: "red" })
    } finally {
      setPending(null)
    }
  }

  const create = async () => {
    const nm = newName.trim()
    if (!nm) return
    try {
      const list = await createList({ name: nm, description: null, is_public: false })
      await addGamesToList(list.id, [gamePayload])
      notifications.show({ title: "List created", message: `"${nm}" created & game added`, color: "green" })
      onRefresh()
      setNewName("")
      setCreating(false)
    } catch {
      notifications.show({ title: "Error", message: "Failed to create list", color: "red" })
    }
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <>
          <Text fw={700} fz={19}>
            Add to list
          </Text>
          <Text fz="sm" c="dark.2">
            {gameName}
          </Text>
        </>
      }
      size="md">
      <Stack gap={2} mb="sm">
        {customLists.map((l) => {
          const on = inListIds.includes(l.id)
          return (
            <Box
              key={l.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 12px",
                borderRadius: "var(--mantine-radius-sm)",
                cursor: "pointer",
                opacity: pending === l.id ? 0.6 : 1,
                background: on ? "color-mix(in oklab, var(--mantine-color-violet-5) 12%, transparent)" : "transparent",
                transition: "background 0.12s",
              }}
              onClick={() => (pending ? undefined : toggle(l.id, on))}>
              <Checkbox checked={on} onChange={() => undefined} color="violet" radius="sm" styles={{ input: { cursor: "pointer" } }} />
              <Text fz="sm" fw={500} style={{ flex: 1 }}>
                {l.name}
              </Text>
              {l.is_public ? (
                <GlobeIcon size={13} style={{ color: "#7CC8E3" }} />
              ) : (
                <LockIcon size={13} style={{ color: "var(--mantine-color-dark-2)" }} />
              )}
            </Box>
          )
        })}
      </Stack>

      {creating ? (
        <Group gap="xs" mt="sm">
          <TextInput
            placeholder="New list name…"
            value={newName}
            autoFocus
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            style={{ flex: 1 }}
          />
          <Button onClick={create}>Create</Button>
          <Button
            variant="default"
            onClick={() => {
              setCreating(false)
              setNewName("")
            }}>
            Cancel
          </Button>
        </Group>
      ) : (
        <Button variant="outline" color="gray" fullWidth mt="sm" leftSection={<PlusIcon size={16} />} onClick={() => setCreating(true)}>
          Create new list
        </Button>
      )}
    </Modal>
  )
}

function ScreenshotGalleryModal({
  opened,
  onClose,
  screenshots,
  initialIndex,
  gameName,
}: {
  opened: boolean
  onClose: () => void
  screenshots: Array<{ id: number; image: string }>
  initialIndex: number
  gameName: string
}) {
  const [index, setIndex] = useState(initialIndex)
  const isMobile = useMediaQuery("(max-width: 48em)")
  const thumbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (opened) setIndex(initialIndex)
  }, [opened, initialIndex])

  useEffect(() => {
    thumbRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [index])

  const prev = () => setIndex((i) => (i - 1 + screenshots.length) % screenshots.length)
  const next = () => setIndex((i) => (i + 1) % screenshots.length)

  useHotkeys([
    ["ArrowLeft", () => { if (opened) prev() }],
    ["ArrowRight", () => { if (opened) next() }],
  ])

  const current = screenshots[index]

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={isMobile ? "100%" : "90%"}
      fullScreen={isMobile}
      padding={0}
      withCloseButton={false}
      styles={{
        content: { background: "rgba(8,10,18,0.97)", backdropFilter: "blur(24px)" },
        body: { padding: 0 },
        header: { display: "none" },
      }}
      radius="lg"
    >
      {/* Header */}
      <Box p="md" pb="sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Group justify="space-between" align="center">
          <Group gap={8}>
            <PhotoIcon size={15} style={{ color: "var(--mantine-color-dark-3)" }} />
            <Text fz="sm" c="dark.1" fw={500}>{gameName}</Text>
          </Group>
          <Group gap="xs">
            <Text fz="sm" c="dark.3" ff="monospace">{index + 1} / {screenshots.length}</Text>
            <ActionIcon variant="subtle" color="gray" radius="xl" onClick={onClose}>
              <XIcon size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main image */}
      <Box style={{ position: "relative" }} p="md" pb={screenshots.length > 1 ? "sm" : "md"}>
        <Box
          style={{
            aspectRatio: "16/9",
            width: "100%",
            borderRadius: "var(--mantine-radius-md)",
            overflow: "hidden",
            background: "var(--mantine-color-dark-8)",
          }}
        >
          <img
            src={current.image}
            alt={`${gameName} screenshot ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </Box>

        {screenshots.length > 1 && (
          <>
            <ActionIcon
              variant="filled"
              color="dark"
              radius="xl"
              size={isMobile ? "md" : "lg"}
              style={{
                position: "absolute",
                left: isMobile ? 20 : 28,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={prev}
            >
              <ChevronLeftIcon size={isMobile ? 16 : 20} />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              color="dark"
              radius="xl"
              size={isMobile ? "md" : "lg"}
              style={{
                position: "absolute",
                right: isMobile ? 20 : 28,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={next}
            >
              <ChevronIcon size={isMobile ? 16 : 20} />
            </ActionIcon>
          </>
        )}
      </Box>

      {/* Thumbnail strip */}
      {screenshots.length > 1 && (
        <ScrollArea type="hover" scrollbarSize={4}>
          <Group gap={6} wrap="nowrap" px="md" pb="md">
            {screenshots.map((shot, i) => (
              <Box
                key={shot.id}
                ref={i === index ? thumbRef : undefined}
                onClick={() => setIndex(i)}
                style={{
                  width: 72,
                  aspectRatio: "16/9",
                  borderRadius: 6,
                  overflow: "hidden",
                  cursor: "pointer",
                  flexShrink: 0,
                  outline: i === index ? "2px solid var(--mantine-color-violet-5)" : "1px solid rgba(255,255,255,0.08)",
                  outlineOffset: i === index ? 2 : 0,
                  opacity: i === index ? 1 : 0.45,
                  transition: "opacity 0.15s, outline-color 0.1s",
                }}
              >
                <img
                  src={shot.image}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </Box>
            ))}
          </Group>
        </ScrollArea>
      )}
    </Modal>
  )
}
