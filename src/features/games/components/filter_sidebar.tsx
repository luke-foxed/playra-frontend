import { Box, Group, Text, Slider, UnstyledButton, NumberInput } from "@mantine/core"
import { useState, useEffect, useRef } from "react"
import { GENRES, PLATFORMS, chipBase } from "../constants"
import type { Status } from "../constants"

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

type Props = {
  open: boolean
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
  open, currentStatus, currentGenres, currentPlatforms, minScore, dateFrom, dateTo,
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
    const id = setTimeout(() => onDateRangeChange(localFrom, localTo), 600)
    return () => clearTimeout(id)
  }, [localFrom, localTo]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Box
      style={{
        width: open ? 248 : 0,
        minWidth: open ? 248 : 0,
        overflow: "hidden",
        transition: "width 0.28s ease, min-width 0.28s ease",
        flexShrink: 0,
        position: "sticky",
        top: 88,
        alignSelf: "flex-start",
      }}>
      <Box style={{ width: 248 }}>
        <Box
          style={{
            background: "#0E1428",
            border: "1px solid rgba(139,107,255,0.18)",
            borderRadius: 16,
            overflow: "hidden",
          }}>
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

          <Box style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

          <Box px={18} pt={20} pb={20}>
            <SectionLabel>Genre</SectionLabel>
            <Box style={{ display: "flex", flexWrap: "wrap", gap: "7px 6px" }}>
              {GENRES.map((g) => (
                <FilterChip key={g.slug} label={g.label} active={currentGenres.includes(g.slug)} onClick={() => onGenreToggle(g.slug)} />
              ))}
            </Box>
          </Box>

          <Box style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

          <Box px={18} pt={20} pb={20}>
            <SectionLabel>Platform</SectionLabel>
            <Box style={{ display: "flex", flexWrap: "wrap", gap: "7px 6px" }}>
              {PLATFORMS.map((p) => (
                <FilterChip key={p.id} label={p.label} active={currentPlatforms.includes(p.id)} onClick={() => onPlatformToggle(p.id)} />
              ))}
            </Box>
          </Box>

          <Box style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

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

          <Box style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

          <Box px={18} pt={20} pb={22}>
            <SectionLabel>Release year</SectionLabel>
            <Group gap={8} align="center" wrap="nowrap">
              <NumberInput
                placeholder="From"
                min={1970}
                max={2030}
                value={localFrom ? parseInt(localFrom) : ""}
                onChange={(val) => setLocalFrom(typeof val === "number" ? String(val) : "")}
                size="xs"
                hideControls
                styles={{ input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 8 } }}
                style={{ flex: 1 }}
              />
              <Text fz="xs" c="dark.3">—</Text>
              <NumberInput
                placeholder="To"
                min={1970}
                max={2030}
                value={localTo ? parseInt(localTo) : ""}
                onChange={(val) => setLocalTo(typeof val === "number" ? String(val) : "")}
                size="xs"
                hideControls
                styles={{ input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 8 } }}
                style={{ flex: 1 }}
              />
            </Group>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
