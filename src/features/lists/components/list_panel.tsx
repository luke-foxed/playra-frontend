import { useState } from "react"
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Loader,
  Modal,
  NavLink,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import useGetLists from "../hooks/useGetLists"
import useGetList from "../hooks/useGetList"
import useCreateList from "../hooks/useCreateList"
import useRemoveGameFromList from "../hooks/useRemoveGameFromList"
import { updateList } from "../api/lists"
import { GlobeIcon, LockIcon } from "../../shared/icons"

type Props = {
  profileUserId: string
  currentUserId: string | null
}

const LIST_TYPE_ORDER = { wishlist: 0, ratings: 1, custom: 2 } as const

export default function ListPanel({ profileUserId, currentUserId }: Props) {
  const isOwnProfile = profileUserId === currentUserId
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [createOpen, { open: openCreate, close: closeCreate }] = useDisclosure(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: lists, isLoading: listsLoading, isError: listsError } = useGetLists(profileUserId)
  const { data: listDetail, isLoading: detailLoading } = useGetList(selectedListId)
  const { createList, isLoading: createLoading } = useCreateList()
  const { removeGame, isLoading: removeLoading } = useRemoveGameFromList()

  const togglePublic = async (list: { id: string; name: string; description: string | null; is_public: boolean }) => {
    setTogglingId(list.id)
    try {
      await updateList(list.id, { name: list.name, description: list.description, is_public: !list.is_public })
      qc.invalidateQueries({ queryKey: ["lists"] })
    } finally {
      setTogglingId(null)
    }
  }

  const form = useForm({
    initialValues: { name: "", description: "", is_public: false },
    validate: { name: (v) => (v.trim() ? null : "Name required") },
  })

  if (listsLoading) return <Loader size="sm" mt="xl" />
  if (listsError) return <Text c="red" size="sm" mt="xl">Failed to load lists.</Text>
  if (!lists) return null

  const sortedLists = [...lists].sort(
    (a, b) => LIST_TYPE_ORDER[a.type] - LIST_TYPE_ORDER[b.type],
  )

  return (
    <Box mt="xl">
      <Group justify="space-between" mb="sm">
        <Title order={3}>Lists</Title>
        {isOwnProfile && (
          <Button size="xs" variant="light" onClick={openCreate}>
            + New List
          </Button>
        )}
      </Group>

      {sortedLists.length === 0 ? (
        <Text c="dimmed" size="sm">No lists yet.</Text>
      ) : (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Stack gap={2}>
              {sortedLists.map((list) => (
                <NavLink
                  key={list.id}
                  label={list.name}
                  description={list.type !== "custom" ? list.type : undefined}
                  active={list.id === selectedListId}
                  onClick={() => setSelectedListId(list.id)}
                  rightSection={
                    isOwnProfile ? (
                      <Tooltip label={list.is_public ? "Make private" : "Make public"} withArrow position="right">
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color={list.is_public ? "cyan" : "gray"}
                          loading={togglingId === list.id}
                          onClick={(e) => { e.stopPropagation(); togglePublic(list) }}
                        >
                          {list.is_public ? <GlobeIcon size={11} /> : <LockIcon size={11} />}
                        </ActionIcon>
                      </Tooltip>
                    ) : list.is_public ? null : (
                      <Badge size="xs" variant="outline" color="gray">private</Badge>
                    )
                  }
                />
              ))}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 9 }}>
            {!selectedListId && (
              <Text c="dimmed" size="sm" mt="xs">
                Select a list to view its games.
              </Text>
            )}

            {selectedListId && detailLoading && <Loader size="sm" />}

            {listDetail && (
              <Stack gap="sm">
                {listDetail.description && (
                  <Text size="sm" c="dimmed">
                    {listDetail.description}
                  </Text>
                )}

                {listDetail.games.length === 0 ? (
                  <Text c="dimmed" size="sm">No games in this list yet.</Text>
                ) : (
                  <Grid>
                    {listDetail.games.map((game) => (
                      <Grid.Col key={game.game_id} span={{ base: 6, sm: 4, md: 3 }}>
                        <Card
                          shadow="sm"
                          padding="sm"
                          component="a"
                          href={`/games/${game.game_id}`}
                          style={{ position: "relative" }}
                        >
                          {isOwnProfile && (
                            <ActionIcon
                              size="xs"
                              color="red"
                              variant="subtle"
                              style={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
                              loading={removeLoading}
                              onClick={(e) => {
                                e.preventDefault()
                                removeGame({ listId: listDetail.id, gameId: game.game_id }).catch(() => {})
                              }}
                              aria-label="Remove from list"
                            >
                              ✕
                            </ActionIcon>
                          )}
                          <Card.Section>
                            <Image src={game.background_image} h={90} alt={game.name} />
                          </Card.Section>
                          <Text size="sm" fw={500} mt="xs" lineClamp={2}>
                            {game.name}
                          </Text>
                          {game.metacritic != null && (
                            <Badge size="xs" color="green" mt={4}>
                              {game.metacritic}
                            </Badge>
                          )}
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                )}
              </Stack>
            )}
          </Grid.Col>
        </Grid>
      )}

      <Modal opened={createOpen} onClose={closeCreate} title="Create List" size="sm">
        <form onSubmit={form.onSubmit(async () => {
          const list = await createList({
            name: form.values.name.trim(),
            description: form.values.description.trim() || null,
            is_public: form.values.is_public,
          })
          form.reset()
          closeCreate()
          setSelectedListId(list.id)
        })}>
          <Stack gap="sm">
            <TextInput label="Name" required {...form.getInputProps("name")} />
            <Textarea label="Description" autosize minRows={2} {...form.getInputProps("description")} />
            <Switch label="Public" {...form.getInputProps("is_public", { type: "checkbox" })} />
            <Button type="submit" loading={createLoading}>
              Create
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  )
}
