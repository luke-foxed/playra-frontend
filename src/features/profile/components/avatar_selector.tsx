import { useState, useEffect } from 'react'
import { Box, Stack, Text, Slider, Group, ActionIcon, Tooltip } from '@mantine/core'
import { ShuffleIcon } from '../../shared/icons'

const BASE = 'https://api.dicebear.com/10.x/notionists-neutral/svg'

const MOUTH_VARIANTS = [
  'variant01', 'variant02', 'variant05', 'variant06', 'variant07', 'variant08', 'variant09',
  'variant10', 'variant11', 'variant12', 'variant13', 'variant14', 'variant15', 'variant16',
  'variant17', 'variant18', 'variant19', 'variant20', 'variant21', 'variant22', 'variant23',
  'variant24', 'variant25', 'variant26', 'variant27', 'variant28', 'variant29', 'variant30',
]

function range(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `variant${String(i + 1).padStart(2, '0')}`)
}

const VARIANTS = {
  eyebrows: range(13),
  eyes: range(5),
  glasses: [null, ...range(11)] as (string | null)[],
  mouth: MOUTH_VARIANTS,
  nose: range(20),
}

type Component = keyof typeof VARIANTS
type Selections = Record<Component, number>

const LABELS: [Component, string][] = [
  ['eyebrows', 'Eyebrows'],
  ['eyes', 'Eyes'],
  ['glasses', 'Glasses'],
  ['mouth', 'Mouth'],
  ['nose', 'Nose'],
]

function buildUrl(seed: string, sel: Selections): string {
  const p = new URLSearchParams({ seed })
  const eyebrows = VARIANTS.eyebrows[sel.eyebrows]
  if (eyebrows) p.set('eyebrowsVariant', eyebrows)
  const eyes = VARIANTS.eyes[sel.eyes]
  if (eyes) p.set('eyesVariant', eyes)
  const glasses = VARIANTS.glasses[sel.glasses]
  p.set('glassesProbability', glasses ? '100' : '0')
  if (glasses) p.set('glassesVariant', glasses)
  const mouth = VARIANTS.mouth[sel.mouth]
  if (mouth) p.set('mouthVariant', mouth)
  const nose = VARIANTS.nose[sel.nose]
  if (nose) p.set('noseVariant', nose)
  return `${BASE}?${p.toString()}`
}

function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10)
}

function randIdx(key: Component): number {
  return Math.floor(Math.random() * VARIANTS[key].length)
}

function parseInitial(url: string | null): { seed: string; sel: Selections } {
  const def: Selections = { eyebrows: 0, eyes: 0, glasses: 0, mouth: 0, nose: 0 }
  if (!url?.includes('dicebear.com')) return { seed: randomSeed(), sel: def }
  try {
    const u = new URL(url)
    const seed = u.searchParams.get('seed') ?? randomSeed()
    const idx = (arr: (string | null)[], val: string | null) => {
      const i = arr.indexOf(val)
      return i < 0 ? 0 : i
    }
    return {
      seed,
      sel: {
        eyebrows: idx(VARIANTS.eyebrows, u.searchParams.get('eyebrowsVariant')),
        eyes: idx(VARIANTS.eyes, u.searchParams.get('eyesVariant')),
        glasses: idx(VARIANTS.glasses, u.searchParams.get('glassesVariant')),
        mouth: idx(VARIANTS.mouth, u.searchParams.get('mouthVariant')),
        nose: idx(VARIANTS.nose, u.searchParams.get('noseVariant')),
      },
    }
  } catch {
    return { seed: randomSeed(), sel: def }
  }
}

export function AvatarSelector({
  initialUrl,
  onChange,
}: {
  initialUrl: string | null
  onChange: (url: string) => void
}) {
  const init = parseInitial(initialUrl)
  const [seed, setSeed] = useState(init.seed)
  const [sel, setSel] = useState<Selections>(init.sel)

  const url = buildUrl(seed, sel)

  // sync the initial url to the parent once (it may differ from the stored avatar)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onChange(url) }, [])

  const update = (key: Component, idx: number) => {
    const next = { ...sel, [key]: idx }
    setSel(next)
    onChange(buildUrl(seed, next))
  }

  const shuffle = () => {
    const newSeed = randomSeed()
    const newSel: Selections = {
      eyebrows: randIdx('eyebrows'),
      eyes: randIdx('eyes'),
      glasses: randIdx('glasses'),
      mouth: randIdx('mouth'),
      nose: randIdx('nose'),
    }
    setSeed(newSeed)
    setSel(newSel)
    onChange(buildUrl(newSeed, newSel))
  }

  return (
    <Box
      style={{
        background: 'var(--mantine-color-dark-6)',
        borderRadius: 'var(--mantine-radius-md)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        padding: '14px 16px 20px',
      }}
    >
      <Group justify="space-between" align="center" mb={16}>
        <Text fz="xs" tt="uppercase" fw={700} c="dark.1" ff="monospace" style={{ letterSpacing: '0.09em' }}>
          Avatar
        </Text>
        <Tooltip label="Randomise" position="left" withArrow>
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={shuffle}>
            <ShuffleIcon size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>
        {/* Preview */}
        <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Box
            style={{
              width: 140, height: 140, borderRadius: '50%',
              background: 'var(--mantine-color-dark-7)',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.10)',
              overflow: 'hidden',
            }}
          >
            <img src={url} alt="Avatar preview" style={{ width: '100%', height: '100%' }} />
          </Box>
        </Box>

        {/* Sliders */}
        <Stack gap="lg">
          {LABELS.map(([key, label]) => {
            const count = VARIANTS[key].length
            const val = sel[key]
            const isGlasses = key === 'glasses'
            const badge = isGlasses
              ? val === 0 ? 'None' : `${val} / ${count - 1}`
              : `${val + 1} / ${count}`

            return (
              <Box key={key}>
                <Group justify="space-between" mb={8}>
                  <Text fz="sm" fw={500}>{label}</Text>
                  <Box
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 999,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontFamily: 'var(--mantine-font-family-monospace)',
                      color: 'var(--mantine-color-dark-1)',
                    }}
                  >
                    {badge}
                  </Box>
                </Group>
                <Slider
                  min={0}
                  max={count - 1}
                  step={1}
                  value={val}
                  onChange={(v) => update(key, v)}
                  size="xs"
                  thumbSize={14}
                  color="violet"
                  label={null}
                  styles={{
                    track: { cursor: 'pointer' },
                    thumb: { border: '2px solid var(--mantine-color-violet-4)' },
                  }}
                />
              </Box>
            )
          })}
        </Stack>
    </Box>
  )
}
