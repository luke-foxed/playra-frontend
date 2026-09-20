import { useState, useEffect, useRef } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { Modal, Box, Text, Group, Loader, Stack, Skeleton, Input, ActionIcon, Kbd, Flex, Center, UnstyledButton } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getGames, popularGamesQueryOptions } from '../../features/games/api/games'
import MetacriticBadge from './metacritic_badge'
import type { Game } from '../games/api/schemas'
import { ChevronIcon, SearchIcon, XIcon } from './icons'

type Props = { onClose: () => void }

export default function SearchModal({ onClose }: Props) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: popularData } = useQuery(popularGamesQueryOptions(8))

  const term = q.trim()
  const [debouncedTerm] = useDebouncedValue(term, 280)
  const { data: searchData, isFetching } = useQuery({
    queryKey: ['games', 'search', debouncedTerm],
    queryFn: () => getGames({ page: 1, page_size: 8, search: debouncedTerm }),
    enabled: !!debouncedTerm,
  })
  const results = term ? (searchData?.results ?? []) : []
  const loading = !!term && (debouncedTerm !== term || isFetching)
  const displayed = term ? results : (popularData?.results ?? [])

  useEffect(() => { inputRef.current?.focus() }, [])

  const changeQuery = (value: string) => {
    setQ(value)
    setActive(0)
  }

  const go = (id: number) => {
    onClose()
    navigate({ to: '/games/$id', params: { id: String(id) } })
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return onClose()
    if (!displayed.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, displayed.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); go(displayed[Math.min(active, displayed.length - 1)].id) }
  }

  return (
    <Modal
      opened
      onClose={onClose}
      withCloseButton={false}
      size={640}
      padding={0}
      styles={{
        inner: { alignItems: 'flex-start', paddingTop: '12vh' },
        content: {
          background: 'var(--mantine-color-dark-6)',
          border: '1px solid rgba(255,255,255,0.14)',
          overflow: 'hidden',
        },
        overlay: { backdropFilter: 'blur(5px)' },
        body: { padding: 0 },
      }}
    >
      <Flex align="center" gap={12} px={18} py={14} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <SearchIcon size={18} style={{ color: 'var(--mantine-color-dark-3)', flexShrink: 0 }} />
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => changeQuery(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search games..."
          variant="unstyled"
          flex={1}
          styles={{
            input: { fontSize: 16, fontWeight: 500, color: 'var(--mantine-color-dark-0)', background: 'transparent', padding: 0, height: 'auto', minHeight: 'auto' },
          }}
        />
        {loading && <Loader size={16} color="violet" />}
        {!loading && q && (
          <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Clear search" onClick={() => changeQuery('')}>
            <XIcon size={14} />
          </ActionIcon>
        )}
        <Kbd visibleFrom="sm" style={{ cursor: 'pointer' }} onClick={onClose}>esc</Kbd>
      </Flex>

      <Box p={8} mih={120} mah="60vh" style={{ overflowY: 'auto' }}>
        {loading ? (
          <Stack gap={0}>
            {[0, 1, 2, 3].map((i) => (
              <Box key={i} px={12} py={9} display="grid" style={{ gridTemplateColumns: '44px 1fr', gap: 14, alignItems: 'center' }}>
                <Skeleton width={44} height={44} radius={8} />
                <Stack gap={7}>
                  <Skeleton height={11} width="60%" radius={5} />
                  <Skeleton height={11} width="40%" radius={5} />
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : term && results.length === 0 ? (
          <Center px={24} py={48}>
            <Text c="dark.2">No games found for "{q}"</Text>
          </Center>
        ) : (
          <>
            <Text fz="xs" tt="uppercase" c="dark.2" fw={600} px={12} py={10} style={{ letterSpacing: 1.4 }}>
              {term ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Popular right now'}
            </Text>
            {displayed.map((g, i) => (
              <SearchResultRow key={g.id} game={g} active={i === active} onSelect={() => go(g.id)} onHover={() => setActive(i)} />
            ))}
          </>
        )}
      </Box>

      <Group gap="lg" px="xl" py="sm" visibleFrom="sm" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([k, l]) => (
          <Group key={k} gap={4}>
            <Kbd size="xs">{k}</Kbd>
            <Text fz={12} c="dark.2">{l}</Text>
          </Group>
        ))}
      </Group>
    </Modal>
  )
}

function SearchResultRow({ game, active, onSelect, onHover }: { game: Game; active: boolean; onSelect: () => void; onHover: () => void }) {
  return (
    <UnstyledButton
      onClick={onSelect}
      onMouseEnter={onHover}
      w="100%"
      px={12}
      py={9}
      bdrs={10}
      bg={active ? 'dark.5' : undefined}
      display="grid"
      style={{ gridTemplateColumns: '44px 1fr auto auto', gap: 14, alignItems: 'center' }}
    >
      <Box
        w={44}
        h={44}
        bdrs={8}
        bg="dark.5"
        style={{
          backgroundImage: game.background_image ? `url("${game.background_image}")` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      />
      <Box miw={0}>
        <Text fz="sm" fw={600} c="dark.0" truncate style={{ letterSpacing: -0.3 }}>{game.name}</Text>
        <Text fz="xs" c="dark.2" truncate>{game.released?.slice(0, 4)} · {game.genres.map((x) => x.name).join(', ')}</Text>
      </Box>
      <MetacriticBadge score={game.metacritic} size={32} />
      <ChevronIcon size={16} style={{ color: 'var(--mantine-color-dark-3)' }} />
    </UnstyledButton>
  )
}
