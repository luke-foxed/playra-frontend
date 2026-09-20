import { Box, Group, Title } from '@mantine/core'

type Props = {
  icon: React.ReactNode
  children: React.ReactNode
  right?: React.ReactNode
}

export default function SectionHeading({ icon, children, right }: Props) {
  return (
    <Group gap={10} mb="md" justify="space-between" align="center">
      <Group gap={10}>
        <Box c="violet.4" display="grid">{icon}</Box>
        <Title order={2} style={{ letterSpacing: -0.6 }}>{children}</Title>
      </Group>
      {right}
    </Group>
  )
}
