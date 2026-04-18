import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Theme, Box, Flex, Tabs, IconButton } from '@radix-ui/themes'
import { SunIcon, MoonIcon, DashboardIcon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import Users from './pages/users/Users'
import Roles from './pages/roles/Roles'

const TABS = ['users', 'roles'] as const
type Tab = typeof TABS[number]

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab: Tab = TABS.find(t => location.pathname === `/${t}`) ?? 'users'

  const [appearance, setAppearance] = useState<'light' | 'dark'>('light')
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    if (!TABS.some(t => location.pathname === `/${t}`)) {
      navigate('/users', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <Theme appearance={appearance}>
      <Box p="6">
        <Flex justify="end" gap="2" mb="4">
          <IconButton
            variant="ghost"
            color="gray"
            aria-label="Toggle density"
            onClick={() => setCompact(c => !c)}
          >
            {compact ? <HamburgerMenuIcon /> : <DashboardIcon />}
          </IconButton>
          <IconButton
            variant="ghost"
            color="gray"
            aria-label="Toggle theme"
            onClick={() => setAppearance(a => a === 'light' ? 'dark' : 'light')}
          >
            {appearance === 'light' ? <MoonIcon /> : <SunIcon />}
          </IconButton>
        </Flex>

        <Tabs.Root value={activeTab} onValueChange={tab => navigate(`/${tab}`)}>
          <Tabs.List>
            <Tabs.Trigger value="users">Users</Tabs.Trigger>
            <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="users"><Users compact={compact} /></Tabs.Content>
          <Tabs.Content value="roles"><Roles compact={compact} /></Tabs.Content>
        </Tabs.Root>
      </Box>
    </Theme>
  )
}
