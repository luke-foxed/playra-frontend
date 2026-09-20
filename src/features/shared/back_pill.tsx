import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { useHover } from '@mantine/hooks'
import { ArrowLeftIcon } from './icons'

const pillStyle = (hovered: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  background: hovered ? 'rgba(255,255,255,0.12)' : 'rgba(10,15,31,.5)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 999,
  padding: '9px 15px',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--mantine-color-dark-0)',
  textDecoration: 'none',
  marginTop: -20,
  position: 'relative',
  zIndex: 10,
  cursor: 'pointer',
  transform: hovered ? 'translateY(-1px)' : 'none',
  transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
})

export default function BackPill({ children, ...linkProps }: LinkProps & { children: React.ReactNode }) {
  const { hovered, ref } = useHover<HTMLAnchorElement>()
  return (
    <Link {...linkProps} ref={ref} style={pillStyle(hovered)}>
      <ArrowLeftIcon size={16} /> {children}
    </Link>
  )
}

export function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const { hovered, ref } = useHover<HTMLButtonElement>()
  return (
    <button type="button" ref={ref} style={pillStyle(hovered)} onClick={onClick}>
      <ArrowLeftIcon size={16} /> {children}
    </button>
  )
}
