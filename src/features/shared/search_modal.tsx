import { useState, useEffect, useRef } from 'react'
import { Modal, Box, Text, Group, Loader, Stack, Skeleton } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { getGames } from '../../features/games/api/games'
import type { Game } from '../../features/games/api/schemas'
import MetacriticBadge from './metacritic_badge'
import { SearchIcon, XIcon, ChevronIcon } from './icons'

type Props = { onClose: () => void }

export default function SearchModal({ onClose }: Props) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Game[]>([])
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!q.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const data = await getGames({ page: 1, page_size: 8, search: q })
        setResults(data.results)
        setActive(0)
      } finally {
        setLoading(false)
      }
    }, 280)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [q])

  const go = (id: number) => {
    onClose()
    navigate({ to: '/games/$id', params: { id: String(id) } })
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return onClose()
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); go(results[active].id) }
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
      {/* Input row */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <SearchIcon size={20} style={{ color: 'var(--mantine-color-dark-2)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search games, studios, genres…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--mantine-color-dark-0)',
            fontFamily: 'var(--mantine-font-family)',
            fontSize: 18, fontWeight: 500,
          }}
        />
        {loading && <Loader size={17} color="violet" />}
        {!loading && q && (
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mantine-color-dark-2)', display: 'grid', padding: 0 }} onClick={() => setQ('')}>
            <XIcon size={17} />
          </button>
        )}
        <button style={{ background: 'var(--mantine-color-dark-5)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--mantine-color-dark-2)', borderRadius: 7, padding: '4px 9px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--mantine-font-family-monospace)' }} onClick={onClose}>esc</button>
      </Box>

      {/* Results */}
      <Box style={{ overflowY: 'auto', padding: 8, minHeight: 120, maxHeight: '60vh' }}>
        {loading ? (
          <Stack gap={0}>
            {[0, 1, 2, 3].map((i) => (
              <Box key={i} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 14, alignItems: 'center', padding: '9px 12px' }}>
                <Skeleton width={44} height={44} radius={8} />
                <Stack gap={7}>
                  <Skeleton height={11} width="60%" radius={5} />
                  <Skeleton height={11} width="40%" radius={5} />
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : q && results.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Text c="dark.2">No games found for "{q}"</Text>
          </Box>
        ) : (
          <>
            <Text fz="xs" tt="uppercase" style={{ letterSpacing: 1.4 }} c="dark.2" fw={600} px={12} py={10}>
              {q ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Popular right now'}
            </Text>
            {results.map((g, i) => (
              <button
                key={g.id}
                onClick={() => go(g.id)}
                onMouseEnter={() => setActive(i)}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr auto auto',
                  gap: 14,
                  alignItems: 'center',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: i === active ? 'var(--mantine-color-dark-5)' : 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                <Box
                  style={{
                    width: 44, height: 44, borderRadius: 8,
                    backgroundImage: g.background_image ? `url(${g.background_image})` : undefined,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    background: g.background_image ? undefined : 'var(--mantine-color-dark-5)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                />
                <Box style={{ minWidth: 0 }}>
                  <Text fz="sm" fw={600} style={{ letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} c="dark.0">
                    {g.name}
                  </Text>
                  <Text fz="xs" c="dark.2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.released?.slice(0, 4)} · {g.genres.map((x) => x.name).join(', ')}
                  </Text>
                </Box>
                <MetacriticBadge score={g.metacritic} size={32} />
                <ChevronIcon size={16} style={{ color: 'var(--mantine-color-dark-3)' }} />
              </button>
            ))}
          </>
        )}
      </Box>

      {/* Footer */}
      <Group gap="lg" px="xl" py="sm" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([k, l]) => (
          <Group key={k} gap={4}>
            <Text fz={11} ff="monospace" c="dark.2"
              style={{ background: 'var(--mantine-color-dark-5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 7px', lineHeight: 1.4 }}
            >{k}</Text>
            <Text fz={12} c="dark.2">{l}</Text>
          </Group>
        ))}
      </Group>
    </Modal>
  )
}
