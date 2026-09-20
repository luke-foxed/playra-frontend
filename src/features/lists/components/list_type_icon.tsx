import { HeartIcon, ListIcon, StarIcon } from '../../shared/icons'

type Props = { type: string; size?: number; fill?: boolean }

export default function ListTypeIcon({ type, size = 18, fill = false }: Props) {
  if (type === 'wishlist') return <HeartIcon size={size} fill={fill} />
  if (type === 'ratings') return <StarIcon size={size} fill={fill} />
  return <ListIcon size={size} />
}
