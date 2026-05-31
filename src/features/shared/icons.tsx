import {
  IconSearch,
  IconX,
  IconChevronRight,
  IconHeart,
  IconHeartFilled,
  IconClock,
  IconPlayerPlayFilled,
  IconFlame,
  IconSparkles,
  IconStar,
  IconStarFilled,
  IconAdjustments,
  IconArrowLeft,
  IconPlus,
  IconList,
  IconWorld,
  IconLock,
  IconTrash,
  IconPencil,
  IconCheck,
} from '@tabler/icons-react'

type IconProps = { size?: number; fill?: boolean; style?: React.CSSProperties; className?: string }

export const SearchIcon    = ({ size = 18, style, className }: IconProps) => <IconSearch size={size} style={style} className={className} />
export const XIcon         = ({ size = 18, style, className }: IconProps) => <IconX size={size} style={style} className={className} />
export const ChevronIcon   = ({ size = 18, style, className }: IconProps) => <IconChevronRight size={size} style={style} className={className} />
export const ClockIcon     = ({ size = 18, style, className }: IconProps) => <IconClock size={size} style={style} className={className} />
export const PlayIcon      = ({ size = 18, style, className }: IconProps) => <IconPlayerPlayFilled size={size} style={style} className={className} />
export const FireIcon      = ({ size = 18, style, className }: IconProps) => <IconFlame size={size} style={style} className={className} />
export const SparkleIcon   = ({ size = 18, style, className }: IconProps) => <IconSparkles size={size} style={style} className={className} />
export const FilterIcon    = ({ size = 18, style, className }: IconProps) => <IconAdjustments size={size} style={style} className={className} />
export const ArrowLeftIcon = ({ size = 18, style, className }: IconProps) => <IconArrowLeft size={size} style={style} className={className} />
export const PlusIcon      = ({ size = 18, style, className }: IconProps) => <IconPlus size={size} style={style} className={className} />
export const ListIcon      = ({ size = 18, style, className }: IconProps) => <IconList size={size} style={style} className={className} />
export const GlobeIcon     = ({ size = 18, style, className }: IconProps) => <IconWorld size={size} style={style} className={className} />
export const LockIcon      = ({ size = 18, style, className }: IconProps) => <IconLock size={size} style={style} className={className} />
export const TrashIcon     = ({ size = 18, style, className }: IconProps) => <IconTrash size={size} style={style} className={className} />
export const EditIcon      = ({ size = 18, style, className }: IconProps) => <IconPencil size={size} style={style} className={className} />
export const CheckIcon     = ({ size = 18, style, className }: IconProps) => <IconCheck size={size} style={style} className={className} />

export const MetacriticIcon = ({ size = 18, style, className }: IconProps) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={style} className={className}>
    <path d="M11.99 0A12 12 0 1 0 24 12v-0.014A12 12 0 0 0 11.99 0Zm-0.055 2.564a9.399 9.399 0 0 1 9.407 9.389v0.01a9.399 9.399 0 1 1 -9.408 -9.399Zm-1.61 17.198 2.046 -2.046 -3.94 -3.94c-0.165 -0.166 -0.345 -0.373 -0.442 -0.608 -0.221 -0.47 -0.318 -1.203 0.221 -1.742 0.664 -0.664 1.548 -0.387 2.406 0.47l3.788 3.788 2.046 -2.046 -3.954 -3.954a2.48 2.48 0 0 1 -0.456 -0.622c-0.263 -0.539 -0.25 -1.216 0.235 -1.7 0.677 -0.678 1.562 -0.429 2.544 0.553l3.677 3.677 2.046 -2.046 -3.982 -3.982c-2.018 -2.018 -3.912 -1.949 -5.212 -0.65 -0.498 0.499 -0.802 1.024 -0.954 1.618a4.026 4.026 0 0 0 -0.055 1.686l-0.027 0.028c-0.996 -0.414 -2.13 -0.166 -3 0.705 -1.162 1.161 -1.12 2.392 -0.982 3.11l-0.042 0.043 -1.009 -0.816 -1.77 1.77a64.1 64.1 0 0 1 2.213 2.1z" />
  </svg>
)

export const HeartIcon = ({ size = 18, fill = false, style, className }: IconProps) =>
  fill
    ? <IconHeartFilled size={size} style={style} className={className} />
    : <IconHeart size={size} style={style} className={className} />

export const StarIcon = ({ size = 18, fill = false, style, className }: IconProps) =>
  fill
    ? <IconStarFilled size={size} style={style} className={className} />
    : <IconStar size={size} style={style} className={className} />
