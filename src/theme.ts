import { createTheme } from '@mantine/core'
import type { MantineColorsTuple } from '@mantine/core'

declare module '@mantine/core' {
  interface MantineThemeOther {
    metascore: {
      great: { bg: string; color: string }
      ok:    { bg: string; color: string }
      poor:  { bg: string; color: string }
    }
  }
}

const violet: MantineColorsTuple = [
  '#F0ECFF', '#D9D0FF', '#C2B5FF', '#AB99FF',
  '#B098FF',  // 4 — lighter violet
  '#8B6BFF',  // 5 — primary
  '#7355E8',  // 6
  '#5B40C9',  // 7 — dark
  '#4A30A8',  // 8
  '#3A2285',  // 9
]

// Maps Twilight palette to Mantine's dark array
// dark[7] = page bg (darkest)  dark[0] = primary text (lightest)
const dark: MantineColorsTuple = [
  '#F4EFE6',  // 0 — ink (primary text)
  '#B7B8D6',  // 1 — ink-2
  '#6B6E97',  // 2 — ink-3 / dimmed
  '#3A3F66',  // 3 — ink-4
  '#2C3A65',  // 4 — bg-3 / border
  '#1E2A4E',  // 5 — bg-2 / elevated
  '#131A38',  // 6 — bg-1 / surface
  '#0A0F1F',  // 7 — bg-0 / page
  '#070A1C',  // 8
  '#04060F',  // 9
]

const inputStyles = {
  input: {
    background: 'var(--mantine-color-dark-7)',
    borderColor: 'rgba(255,255,255,0.14)',
    color: 'var(--mantine-color-dark-0)',
  },
}

export const theme = createTheme({
  fontFamily: "'Sora', system-ui, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, monospace",
  primaryColor: 'violet',
  primaryShade: { light: 5, dark: 5 },
  defaultRadius: 'md',
  colors: { violet, dark },

  fontSizes: {
    xs: '11px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
  },

  radius: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '20px',
    xl: '28px',
  },

  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  headings: {
    fontFamily: "'Sora', system-ui, sans-serif",
    fontWeight: '800',
    sizes: {
      h1: { fontSize: '44px', lineHeight: '1.02', fontWeight: '800' },
      h2: { fontSize: '24px', lineHeight: '1.2', fontWeight: '700' },
      h3: { fontSize: '19px', lineHeight: '1.3', fontWeight: '700' },
    },
  },

  other: {
    metascore: {
      great: { bg: '#7FE6B9', color: '#06210f' },
      ok:    { bg: '#F0C36B', color: '#2a1c00' },
      poor:  { bg: '#FF6B7E', color: '#2a0008' },
    },
  },

  components: {
    Button: {
      defaultProps: { radius: 'xl' },
      styles: {
        root: {
          fontWeight: '600',
          letterSpacing: '-0.1px',
          transition: 'background 0.15s, transform 0.08s, box-shadow 0.15s',
        },
      },
    },
    Badge: {
      defaultProps: { radius: 'xl' },
    },
    Notification: {
      styles: {
        root: {
          '--notification-radius': '16px',
          background: '#080D1C',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.6)',
          paddingTop: '15px',
          paddingBottom: '15px',
          paddingInlineEnd: '10px',
          alignItems: 'flex-start',
          minWidth: 300,
          maxWidth: 400,
        },
        title: {
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '-0.3px',
          lineHeight: '1.3',
          marginBottom: '3px',
        },
        description: {
          fontSize: '13px',
          color: '#8B8EB8',
          lineHeight: '1.45',
        },
        closeButton: {
          color: '#6B6E97',
          marginTop: '1px',
          width: 24,
          height: 24,
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        overlayProps: { backgroundOpacity: 0.66, blur: 4 },
      },
      styles: {
        content: { background: 'var(--mantine-color-dark-6)' },
        header: {
          background: 'var(--mantine-color-dark-6)',
          paddingBottom: 0,
        },
        body: { paddingTop: 8 },
      },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
      styles: inputStyles,
    },
    Textarea: {
      defaultProps: { radius: 'md' },
      styles: inputStyles,
    },
    PasswordInput: {
      defaultProps: { radius: 'md' },
      styles: inputStyles,
    },
    Drawer: {
      styles: {
        content: { background: 'var(--mantine-color-dark-7)' },
        header: { background: 'var(--mantine-color-dark-7)' },
      },
    },
    Kbd: {
      styles: {
        root: {
          background: 'var(--mantine-color-dark-5)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--mantine-color-dark-2)',
          fontSize: 11,
          padding: '2px 7px',
        },
      },
    },
    Select: {
      defaultProps: { radius: 'xl' },
      styles: {
        input: {
          background: 'var(--mantine-color-dark-6)',
          borderColor: 'rgba(255,255,255,0.14)',
        },
      },
    },
    Slider: {
      defaultProps: { color: 'violet' },
    },
    Card: {
      defaultProps: {
        bg: 'dark.6',
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        bg: 'dark.6',
        radius: 'md',
      },
    },
    Chip: {
      defaultProps: { radius: 'xl', size: 'xs' },
    },
  },
})
