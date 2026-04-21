import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Theme, Box, Flex, Tabs, IconButton } from '@radix-ui/themes'
import { SunIcon, MoonIcon } from '@radix-ui/react-icons'
import { ToastProvider } from './components/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary'
import Users from './pages/users/Users'
import Roles from './pages/roles/Roles'

const TABS = ['users', 'roles'] as const
type Tab = typeof TABS[number]

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab: Tab = TABS.find(t => location.pathname === `/${t}`) ?? 'users'

  const [appearance, setAppearance] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('appearance')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    if (!TABS.some(t => location.pathname === `/${t}`)) {
      navigate('/users', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <Theme appearance={appearance} accentColor="violet"> 
      <ToastProvider>
        <main>
          <Box p="6">
          <Flex justify="end" mb="4">
            <IconButton
              variant="ghost"
              color="gray"
              aria-label="Toggle theme"
              onClick={() => setAppearance(a => {
                const next = a === 'light' ? 'dark' : 'light'
                localStorage.setItem('appearance', next)
                return next
              })}
            >
              {appearance === 'light' ? <MoonIcon /> : <SunIcon />}
            </IconButton>
          </Flex>

          <Tabs.Root value={activeTab} onValueChange={tab => navigate({ pathname: `/${tab}`, search: location.search })}>
            <Tabs.List>
              <Tabs.Trigger value="users">Users</Tabs.Trigger>
              <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="users"><ErrorBoundary><Users /></ErrorBoundary></Tabs.Content>
            <Tabs.Content value="roles"><ErrorBoundary><Roles /></ErrorBoundary></Tabs.Content>
          </Tabs.Root>
          </Box>
        </main>
      </ToastProvider>
    </Theme>
  )
}
