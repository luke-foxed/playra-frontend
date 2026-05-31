import { Rating } from '@mantine/core'

type Props = {
  value: number
  onChange?: (v: number) => void
  size?: number
  readonly?: boolean
}

export default function StarRating({ value, onChange, size = 26, readonly = false }: Props) {
  const mantineSize = size <= 16 ? 'xs' : size <= 20 ? 'sm' : size <= 26 ? 'md' : size <= 34 ? 'lg' : 'xl'
  return (
    <Rating
      value={value}
      onChange={readonly ? undefined : onChange}
      readOnly={readonly}
      size={mantineSize}
      color="yellow"
    />
  )
}
