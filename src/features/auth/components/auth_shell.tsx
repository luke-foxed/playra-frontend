import { Center, Paper, Stack, Text, Title } from '@mantine/core'
import Logo from '../../shared/logo'

type Props = {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <Center mih="100dvh" p="xl">
      <Stack align="center" gap="xl" w="100%" maw={420}>
        <Stack align="center" gap={10}>
          <Logo size={52} />
          <Text fw={700} fz={26} c="dark.0" style={{ letterSpacing: -0.8 }}>playra</Text>
        </Stack>

        <Paper w="100%" p="xl" radius="lg" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <Title order={2} mb={6} fw={800} style={{ letterSpacing: -0.6 }}>{title}</Title>
          <Text fz="sm" c="dark.2" mb="xl">{subtitle}</Text>
          {children}
          <Text ta="center" fz="sm" c="dark.2" mt="lg">{footer}</Text>
        </Paper>
      </Stack>
    </Center>
  )
}
