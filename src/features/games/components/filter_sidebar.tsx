import { Anchor, Box, Chip, Collapse, Flex, Group, Text, Slider, UnstyledButton } from "@mantine/core"
import type { MantineBreakpoint } from "@mantine/core"
import { YearPickerInput } from "@mantine/dates"
import { useState } from "react"
import { useDebouncedCallback } from "@mantine/hooks"
import { PLATFORMS, EXPANDED_PLATFORM_IDS } from "../constants"
import type { Status } from "../constants"
import { ChevronIcon } from "../../shared/icons"
import useGetGenres from "../hooks/useGetGenres"
import useGetPlatforms from "../hooks/useGetPlatforms"

function FilterSection({
  label, summary, children, py = [20, 20], defaultOpen = true,
}: { label: React.ReactNode; summary?: string; children: React.ReactNode; py?: [number, number]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Box px={18} pt={py[0]} pb={py[1]} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <UnstyledButton onClick={() => setOpen((o) => !o)} style={{ width: '100%' }}>
        <Group justify="space-between" align="center" wrap="nowrap" gap={8} mb={open ? 12 : 0}>
          <Group gap={9} align="center" wrap="nowrap" style={{ minWidth: 0 }}>
            <Box w={3} h={13} bdrs={2} bg="#7355E8" style={{ flexShrink: 0 }} />
            <Text fz="sm" tt="uppercase" fw={700} c="#8B8EB8" style={{ letterSpacing: 1.2 }}>{label}</Text>
          </Group>
          <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
            {summary && <Text fz="xs" c="dark.2" truncate maw={110}>{summary}</Text>}
            <ChevronIcon size={11} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }} />
          </Group>
        </Group>
      </UnstyledButton>
      <Collapse expanded={open}>{children}</Collapse>
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
  onGenreToggle: (id: string) => void
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
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)
  const { data: allPlatforms, isFetching: platformsLoading, refetch: fetchAllPlatforms } = useGetPlatforms()

  const curatedIds = new Set(PLATFORMS.map((p) => p.id))
  const extraPlatforms = (allPlatforms ?? []).filter((p) => !curatedIds.has(String(p.id)) && EXPANDED_PLATFORM_IDS.has(String(p.id)))

  const platformLabel = (id: string) =>
    PLATFORMS.find((p) => p.id === id)?.label
    ?? allPlatforms?.find((p) => String(p.id) === id)?.abbreviation
    ?? allPlatforms?.find((p) => String(p.id) === id)?.name
    ?? id
  const genreLabel = (id: string) => genres.find((g) => String(g.id) === id)?.name ?? id

  const summarize = (labels: string[], max = 2) => {
    if (!labels.length) return "Any"
    if (labels.length <= max) return labels.join(", ")
    return `${labels.slice(0, max).join(", ")} +${labels.length - max}`
  }

  const statusSummary = currentStatus === "all" ? "Any" : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
  const genreSummary = summarize(currentGenres.map(genreLabel))
  const platformSummary = summarize(currentPlatforms.map(platformLabel))
  const yearSummary = localFrom && localTo ? `${localFrom}–${localTo}` : localFrom ? `${localFrom}+` : localTo ? `Up to ${localTo}` : "Any"

  return (
    <>
      <FilterSection label="Status" summary={statusSummary} py={[22, 20]}>
        <Group gap={6}>
          {(["all", "released", "upcoming"] as Status[]).map((s) => (
            <Chip key={s} size="sm" checked={currentStatus === s} onChange={() => onStatusChange(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Chip>
          ))}
        </Group>
      </FilterSection>

      <FilterSection label="Genre" summary={genreSummary}>
        <Flex wrap="wrap" gap="7px 6px">
          {genres.map((g) => (
            <Chip key={g.id} checked={currentGenres.includes(String(g.id))} onChange={() => onGenreToggle(String(g.id))}>{g.name}</Chip>
          ))}
        </Flex>
      </FilterSection>

      <FilterSection label="Platform" summary={platformSummary}>
        <Flex wrap="wrap" gap="7px 6px">
          {PLATFORMS.map((p) => (
            <Chip key={p.id} checked={currentPlatforms.includes(p.id)} onChange={() => onPlatformToggle(p.id)}>{p.label}</Chip>
          ))}
          {showAllPlatforms && extraPlatforms.map((p) => (
            <Chip key={p.id} checked={currentPlatforms.includes(String(p.id))} onChange={() => onPlatformToggle(String(p.id))}>
              {p.abbreviation ?? p.name}
            </Chip>
          ))}
        </Flex>
        {!showAllPlatforms ? (
          <Anchor
            component="button"
            type="button"
            fz="xs"
            c="violet.4"
            fw={500}
            mt={10}
            onClick={() => { setShowAllPlatforms(true); fetchAllPlatforms() }}
          >
            {platformsLoading ? "Loading…" : "Show all platforms"}
          </Anchor>
        ) : (
          <Anchor component="button" type="button" fz="xs" c="dark.2" fw={500} mt={10} onClick={() => setShowAllPlatforms(false)}>
            Show fewer
          </Anchor>
        )}
      </FilterSection>

      <FilterSection label="Min critic score" summary={minScore > 0 ? `${minScore}+` : "Any"} py={[20, 26]}>
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

      <FilterSection label="Release year" summary={yearSummary} py={[20, 22]}>
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
  onGenreToggle: (id: string) => void
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
          <Box
            bg="#0E1428"
            bdrs={16}
            bd="1px solid rgba(139,107,255,0.18)"
            style={{ overflowX: "hidden", overflowY: "auto", maxHeight: "calc(100vh - 110px)" }}
          >
            <FilterSections {...sectionsProps} />
          </Box>
        )}
      </Box>
    </Box>
  )
}
