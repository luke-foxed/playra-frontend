import { Rating, Tooltip } from '@mantine/core'
import { useState } from 'react'

type Props = {
  value: number
  onChange?: (v: number) => void
  size?: number
  readonly?: boolean
}

export default function StarRating({ value, onChange, size = 24, readonly = false }: Props) {
  const [tooltipValue, setTooltipValue] = useState(0)

  return (
    <Tooltip bg='dark' color='white' fw="bold" label={`${tooltipValue}/10`} withArrow>
      <Rating
        fractions={2}
        count={10}
        value={value}
        onChange={readonly ? undefined : onChange}
        readOnly={readonly}
        size={size}
        onHover={(v) => setTooltipValue(v)}
        color='yellow'
      />
    </Tooltip>
  )
}
