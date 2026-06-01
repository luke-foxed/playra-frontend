import { Box, Group, Text, Slider, UnstyledButton } from "@mantine/core"
import { YearPickerInput } from "@mantine/dates"
import { useState, useEffect, useRef } from "react"
import { PLATFORMS, chipBase } from "../constants"
import type { Status } from "../constants"
import useGetGenres from "../hooks/useGetGenres"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Group gap={9} mb={12} align="center">
      <Box style={{ width: 3, height: 13, borderRadius: 2, background: "#7355E8", flexShrink: 0 }} />
      <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: 1.2, color: "#8B8EB8" }}>
        {children}
      </Text>
    </Group>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <UnstyledButton
      onClick={onClick}
      className="filter-chip"
      data-active={active || undefined}
      style={{
        ...chipBase,
        padding: "5px 12px",
        fontWeight: active ? 700 : 500,
        border: active ? "1px solid #8B6BFF" : "1px solid rgba(255,255,255,0.18)",
        background: active ? "#8B6BFF" : "rgba(255,255,255,0.06)",
        color: active ? "#fff" : "#B7B8D6",
        boxShadow: active ? "0 0 14px rgba(139,107,255,0.55), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
      }}>
      {label}
    </UnstyledButton>
  )
}

function StatusChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <UnstyledButton
      onClick={onClick}
      className="filter-chip"
      data-active={active || undefined}
      style={{
        ...chipBase,
        padding: "6px 14px",
        fontWeight: 700,
        border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.18)",
        background: active ? "linear-gradient(135deg, #9B7BFF, #7355E8)" : "rgba(255,255,255,0.06)",
        color: active ? "#fff" : "#B7B8D6",
        boxShadow: active ? "0 0 18px rgba(139,107,255,0.6), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
      }}>
      {label}
    </UnstyledButton>
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
  onLocalFromChange: (v: string) => void
  onLocalToChange: (v: string) => void
}

function Divider() {
  return <Box style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
}

function FilterSections({
  currentStatus, currentGenres, currentPlatforms, minScore, localFrom, localTo,
  onStatusChange, onGenreToggle, onPlatformToggle, onMinScoreChange,
  onLocalFromChange, onLocalToChange,
}: SectionsProps) {
  const { data: genres = [] } = useGetGenres()

  return (
    <>
      <Box px={18} pt={22} pb={20}>
        <SectionLabel>Status</SectionLabel>
        <Group gap={6}>
          {(["all", "released", "upcoming"] as Status[]).map((s) => (
            <StatusChip
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              active={currentStatus === s}
              onClick={() => onStatusChange(s)}
            />
          ))}
        </Group>
      </Box>

      <Divider />

      <Box px={18} pt={20} pb={20}>
        <SectionLabel>Genre</SectionLabel>
        <Box style={{ display: "flex", flexWrap: "wrap", gap: "7px 6px" }}>
          {genres.map((g) => (
            <FilterChip key={g.slug} label={g.name} active={currentGenres.includes(g.slug)} onClick={() => onGenreToggle(g.slug)} />
          ))}
        </Box>
      </Box>

      <Divider />

      <Box px={18} pt={20} pb={20}>
        <SectionLabel>Platform</SectionLabel>
        <Box style={{ display: "flex", flexWrap: "wrap", gap: "7px 6px" }}>
          {PLATFORMS.map((p) => (
            <FilterChip key={p.id} label={p.label} active={currentPlatforms.includes(p.id)} onClick={() => onPlatformToggle(p.id)} />
          ))}
        </Box>
      </Box>

      <Divider />

      <Box px={18} pt={20} pb={26}>
        <SectionLabel>Min critic score{minScore ? ` · ${minScore}` : ""}</SectionLabel>
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
      </Box>

      <Divider />

      <Box px={18} pt={20} pb={22}>
        <SectionLabel>Release year</SectionLabel>
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
            onLocalFromChange(from ? from.slice(0, 4) : "")
            onLocalToChange(to ? to.slice(0, 4) : "")
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
      </Box>
    </>
  )
}

type Props = {
  open: boolean
  inDrawer?: boolean
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
  open, inDrawer, currentStatus, currentGenres, currentPlatforms, minScore, dateFrom, dateTo,
  onStatusChange, onGenreToggle, onPlatformToggle, onMinScoreChange, onDateRangeChange,
}: Props) {
  const [localFrom, setLocalFrom] = useState(dateFrom)
  const [localTo, setLocalTo] = useState(dateTo)
  const isExternalUpdate = useRef(false)

  // Sync when URL changes (e.g. status preset clears custom range)
  useEffect(() => {
    isExternalUpdate.current = true
    setLocalFrom(dateFrom)
    setLocalTo(dateTo)
  }, [dateFrom, dateTo])

  // Debounced fire — skips URL-driven syncs
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false
      return
    }
    const complete = (!!localFrom && !!localTo) || (!localFrom && !localTo)
    if (!complete) return
    const id = setTimeout(() => onDateRangeChange(localFrom, localTo), 600)
    return () => clearTimeout(id)
  }, [localFrom, localTo]) // eslint-disable-line react-hooks/exhaustive-deps

  const sectionsProps: SectionsProps = {
    currentStatus, currentGenres, currentPlatforms, minScore, localFrom, localTo,
    onStatusChange, onGenreToggle, onPlatformToggle, onMinScoreChange,
    onLocalFromChange: setLocalFrom, onLocalToChange: setLocalTo,
  }

  return (
    <Box
      style={{
        width: inDrawer ? '100%' : open ? 248 : 0,
        minWidth: inDrawer ? '100%' : open ? 248 : 0,
        transition: "width 0.28s ease, min-width 0.28s ease",
        flexShrink: 0,
        ...(inDrawer ? {} : { overflow: "hidden", position: "sticky", top: 88, alignSelf: "flex-start" }),
      }}>
      <Box style={{ width: inDrawer ? '100%' : 248 }}>
        {inDrawer ? (
          <FilterSections {...sectionsProps} />
        ) : (
          <Box style={{ background: "#0E1428", border: "1px solid rgba(139,107,255,0.18)", borderRadius: 16, overflow: "hidden" }}>
            <FilterSections {...sectionsProps} />
          </Box>
        )}
      </Box>
    </Box>
  )
}
