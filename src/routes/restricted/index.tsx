import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { Box, Text, Title, Anchor } from "@mantine/core"

const RestrictedSearchSchema = z.object({
  role: z.enum(["pending", "suspended"]).catch("pending"),
})

export const Route = createFileRoute("/restricted/")({
  component: RouteComponent,
  validateSearch: RestrictedSearchSchema.parse,
})

const ClockIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const BanIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
)

const content = {
  pending: {
    title: "Account Pending",
    message: "Your account is awaiting approval. You'll be notified once it's been reviewed.",
    accent: "#F0C36B",
    Icon: ClockIcon,
  },
  suspended: {
    title: "Account Suspended",
    message: "Your account has been suspended. You are unable to access Playra.",
    accent: "#F47C7C",
    Icon: BanIcon,
  },
}

function RouteComponent() {
  const { role } = Route.useSearch()
  const { title, message, accent, Icon } = content[role]

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--mantine-color-dark-8)",
      }}
    >
      <Box style={{ position: "relative", maxWidth: 460, width: "100%", padding: "0 24px" }}>
        {/* bloom */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 32,
            background: `radial-gradient(ellipse at 50% 0%, color-mix(in oklab, ${accent} 22%, transparent) 0%, transparent 68%)`,
            filter: "blur(28px)",
            pointerEvents: "none",
          }}
        />

        <Box
          style={{
            position: "relative",
            background: "var(--mantine-color-dark-7)",
            borderRadius: 20,
            padding: "44px 40px 38px",
            boxShadow: `0 32px 64px -24px rgba(0,0,0,.65), inset 0 0 0 1px color-mix(in oklab, ${accent} 28%, rgba(255,255,255,0.06))`,
            textAlign: "center",
          }}
        >
          {/* icon badge */}
          <Box
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `color-mix(in oklab, ${accent} 13%, transparent)`,
              boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${accent} 38%, transparent), 0 0 36px color-mix(in oklab, ${accent} 18%, transparent)`,
              color: accent,
              marginBottom: 24,
            }}
          >
            <Icon />
          </Box>

          <Title
            order={2}
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: -0.5,
              color: "var(--mantine-color-dark-0)",
              marginBottom: 10,
            }}
          >
            {title}
          </Title>

          <Text fz={15} c="dark.2" style={{ lineHeight: 1.7, maxWidth: "32ch", margin: "0 auto" }}>
            {message}
          </Text>

          <Box style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "28px 0 24px" }} />

          <Anchor
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13.5,
              fontWeight: 600,
              color: accent,
              textDecoration: "none",
            }}
          >
            ← Back to login
          </Anchor>
        </Box>
      </Box>
    </Box>
  )
}
