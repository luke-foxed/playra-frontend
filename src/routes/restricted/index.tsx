import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useContext, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { Box, Text, Title, Anchor } from "@mantine/core"
import supabase from "../../lib/supabase_client"
import { AuthContext } from "../../features/auth/providers/auth_provider"
import { profileQueryOptions } from "../../features/profile/api/profile"

const RestrictedSearchSchema = z.object({
  role: z.enum(["pending", "suspended"]).catch("pending"),
})

export const Route = createFileRoute("/restricted/")({
  component: RouteComponent,
  validateSearch: RestrictedSearchSchema.parse,
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: "/login", search: { redirect: location.href } })
  },
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
    message: "Your account is awaiting approval. Once approved, you will be able to access Playra and all its features.",
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
  const { role: hintedRole } = Route.useSearch()
  const { session } = useContext(AuthContext)
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    ...profileQueryOptions(session?.user?.id ?? ''),
    enabled: !!session?.user?.id,
    // only a pending account can change state on its own (an admin approves it)
    refetchInterval: (query) => (query.state.data?.role === 'pending' ? 5000 : false),
  })

  // the profile is the source of truth; the search param is only a hint until it loads
  const role = profile?.role === 'suspended' || profile?.role === 'pending' ? profile.role : hintedRole
  const { title, message, accent, Icon } = content[role]

  useEffect(() => {
    if (profile?.role === 'active' || profile?.role === 'admin') {
      navigate({ to: '/' })
    }
  }, [profile?.role, navigate])

  return (
    <Box
      style={{
        minHeight: "100dvh",
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
            component="button"
            type="button"
            onClick={async () => {
              await supabase.auth.signOut()
              navigate({ to: "/login", search: {} })
            }}
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
