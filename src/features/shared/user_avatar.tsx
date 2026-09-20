import { Avatar } from '@mantine/core'
import type { AvatarProps } from '@mantine/core'
import { avatarColor } from './avatar_color'

type Props = AvatarProps & {
  avatarUrl: string | null
  name: string
}

export default function UserAvatar({ avatarUrl, name, style, ...props }: Props) {
  return (
    <Avatar
      src={avatarUrl ?? undefined}
      alt={name}
      radius="xl"
      color="violet"
      style={{ transform: 'translateZ(0)', ...(!avatarUrl ? { background: avatarColor(name) } : {}), ...style }}
      {...props}
    >
      {!avatarUrl && (name[0] ?? '?').toUpperCase()}
    </Avatar>
  )
}
