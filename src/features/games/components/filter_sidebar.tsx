import { Box, Chip, Flex, Group, Text, Slider } from "@mantine/core"
import type { MantineBreakpoint } from "@mantine/core"
import { YearPickerInput } from "@mantine/dates"
import { useState } from "react"
import { useDebouncedCallback } from "@mantine/hooks"
import { PLATFORMS } from "../constants"
import type { Status } from "../constants"
import useGetGenres from "../hooks/useGetGenres"

function FilterSection({ label, children, py = [20, 20] }: { label: React.ReactNode; children: React.ReactNode; py?: [number, number] }) {
  return (
    <Box px={18} pt={py[0]} pb={py[1]} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Group gap={9} mb={12} align="center">
        <Box w={3} h={13} bdrs={2} bg="#7355E8" style={{ flexShrink: 0 }} />
        <Text fz="sm" tt="uppercase" fw={700} c="#8B8EB8" style={{ letterSpacing: 1.2 }}>{label}</Text>
      </Group>
      {children}
    </Box>
  )
}

type SectionsProps = {
  currentStatus: Status
  currentGenres: string[]
  currentPlatforms: string[]
  minScore: number
  localFrom: string
  localTo: string
  onStatusChange: (s: Status) => void
  onGenreToggle: (slug: string) => void
  onPlatformToggle: (id: string) => void
  onMinScoreChange: (val: number) => void
  onLocalRangeChange: (from: string, to: string) => void
}

function FilterSections({
  currentStatus, currentGenres, currentPlatforms, minScore, localFrom, localTo,
  onStatusChange, onGenreToggle, onPlatformToggle, onMinScoreChange,
  onLocalRangeChange,
}: SectionsProps) {
  const { data: genres = [] } = useGetGenres()

  return (
    <>
      <FilterSection label="Status" py={[22, 20]}>
        <Group gap={6}>
          {(["all", "released", "upcoming"] as Status[]).map((s) => (
            <Chip key={s} size="sm" checked={currentStatus === s} onChange={() => onStatusChange(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Chip>
          ))}
        </Group>
      </FilterSection>

      <FilterSection label="Genre">
        <Flex wrap="wrap" gap="7px 6px">
          {genres.map((g) => (
            <Chip key={g.slug} checked={currentGenres.includes(g.slug)} onChange={() => onGenreToggle(g.slug)}>{g.name}</Chip>
          ))}
        </Flex>
      </FilterSection>

      <FilterSection label="Platform">
        <Flex wrap="wrap" gap="7px 6px">
          {PLATFORMS.map((p) => (
            <Chip key={p.id} checked={currentPlatforms.includes(p.id)} onChange={() => onPlatformToggle(p.id)}>{p.label}</Chip>
          ))}
        </Flex>
      </FilterSection>

      <FilterSection label={`Min critic score${minScore ? ` · ${minScore}` : ""}`} py={[20, 26]}>
        <Slider
          value={minScore}
          onChange={onMinScoreChange}
          min={0}
          max={95}
          step={5}
          color="violet"
          label={(v) => v || "Any"}
          styles={{ thumb: { boxShadow: "0 0 10px rgba(139,107,255,0.6)" } }}
        />
        <Group justify="space-between" mt={8}>
          <Text fz="xs" c="dark.3" ff="monospace">Any</Text>
          <Text fz="xs" c="dark.3" ff="monospace">95</Text>
        </Group>
      </FilterSection>

      <FilterSection label="Release year" py={[20, 22]}>
        <YearPickerInput
          type="range"
          placeholder="Any range"
          minDate="1970-01-01"
          maxDate="2030-01-01"
          value={[
            localFrom ? `${localFrom}-01-01` : null,
            localTo ? `${localTo}-01-01` : null,
          ]}
          onChange={(val) => {
            const [from, to] = val as [string | null, string | null]
            onLocalRangeChange(from ? from.slice(0, 4) : "", to ? to.slice(0, 4) : "")
          }}
          size="xs"
          styles={{
            input: {
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
              borderRadius: 8,
            },
            calendarHeader: { color: "#fff" },
            yearsListCell: { color: "#B7B8D6" },
          }}
        />
      </FilterSection>
    </>
  )
}

type Props = {
  open: boolean
  inDrawer?: boolean
  visibleFrom?: MantineBreakpoint
  currentStatus: Status
  currentGenres: string[]
  currentPlatforms: string[]
  minScore: number
  dateFrom: string
  dateTo: string
  onStatusChange: (s: Status) => void
  onGenreToggle: (slug: string) => void
  onPlatformToggle: (id: string) => void
  onMinScoreChange: (val: number) => void
  onDateRangeChange: (from: string, to: string) => void
}

export default function FilterSidebar({
  open, inDrawer, visibleFrom, currentStatus, currentGenres, currentPlatforms, minScore, dateFrom, dateTo,
  onStatusChange, onGenreToggle, onPlatformToggle, onMinScoreChange, onDateRangeChange,
}: Props) {
  const [draft, setDraft] = useState<{ from: string; to: string } | null>(null)
  const [urlDates, setUrlDates] = useState({ dateFrom, dateTo })
  if (urlDates.dateFrom !== dateFrom || urlDates.dateTo !== dateTo) {
    // URL changed externally (e.g. status preset clears the range) — drop the draft
    setUrlDates({ dateFrom, dateTo })
    setDraft(null)
  }
  const localFrom = draft?.from ?? dateFrom
  const localTo = draft?.to ?? dateTo

  const fireDateRange = useDebouncedCallback((from: string, to: string) => {
    const complete = (!!from && !!to) || (!from && !to)
    if (complete) onDateRangeChange(from, to)
  }, 600)

  const changeLocalRange = (from: string, to: string) => {
    setDraft({ from, to })
    fireDateRange(from, to)
  }

  const sectionsProps: SectionsProps = {
    currentStatus, currentGenres, currentPlatforms, minScore, localFrom, localTo,
    onStatusChange, onGenreToggle, onPlatformToggle, onMinScoreChange,
    onLocalRangeChange: changeLocalRange,
  }

  return (
    <Box
      visibleFrom={visibleFrom}
      w={inDrawer ? '100%' : open ? 248 : 0}
      miw={inDrawer ? '100%' : open ? 248 : 0}
      style={{
        flexShrink: 0,
        transition: "width 0.28s ease, min-width 0.28s ease",
        ...(inDrawer ? {} : { overflow: "hidden", position: "sticky", top: 88, alignSelf: "flex-start" }),
      }}>
      <Box w={inDrawer ? '100%' : 248}>
        {inDrawer ? (
          <FilterSections {...sectionsProps} />
        ) : (
          <Box bg="#0E1428" bdrs={16} bd="1px solid rgba(139,107,255,0.18)" style={{ overflow: "hidden" }}>
            <FilterSections {...sectionsProps} />
          </Box>
        )}
      </Box>
    </Box>
  )
}
