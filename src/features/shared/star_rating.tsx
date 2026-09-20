import { Rating, Tooltip } from '@mantine/core'
import { useState, useRef } from 'react'
import { useDebouncedCallback } from '@mantine/hooks'

type Props = {
  value: number
  onChange?: (v: number) => void
  size?: number
  readonly?: boolean
  debounceMs?: number
}

export default function StarRating({ value, onChange, size = 24, readonly = false, debounceMs = 800 }: Props) {
  const [tooltipValue, setTooltipValue] = useState(0)
  const [draft, setDraft] = useState<number | null>(null)
  const isDragging = useRef(false)
  const localValue = draft ?? value

  const fire = useDebouncedCallback((v: number) => {
    onChange?.(v)
    setDraft(null)
  }, debounceMs)

  const commit = (v: number) => {
    setDraft(v)
    fire(v)
  }

  return (
    <Tooltip bg='dark' color='white' fw="bold" label={`${tooltipValue}/10`} withArrow>
      <div
        style={{ display: 'inline-flex', userSelect: 'none', cursor: readonly ? 'default' : 'pointer' }}
        onPointerDown={() => { if (!readonly) isDragging.current = true }}
        onPointerUp={() => { isDragging.current = false }}
        onPointerLeave={() => { isDragging.current = false }}
      >
        <Rating
          fractions={2}
          count={10}
          value={localValue}
          onChange={readonly ? undefined : commit}
          readOnly={readonly}
          size={size}
          onHover={(v) => {
            setTooltipValue(v)
            if (!readonly && isDragging.current && v > 0) commit(v)
          }}
          color='yellow'
        />
      </div>
    </Tooltip>
  )
}
