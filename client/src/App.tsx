import { useState } from 'react'
import { Box, Flex, Tabs, TextField, Button } from '@radix-ui/themes'
import Users from './pages/users/Users'
import Roles from './pages/roles/Roles'

export default function App() {
  const [activeTab, setActiveTab] = useState('users')
  const [search, setSearch] = useState('')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [addRoleOpen, setAddRoleOpen] = useState(false)

  const handleAddClick = () => {
    if (activeTab === 'users') setAddUserOpen(true)
    else setAddRoleOpen(true)
  }

  return (
    <Box p="6">
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="users">Users</Tabs.Trigger>
          <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
        </Tabs.List>

        <Flex gap="3" align="center" my="4">
          <TextField.Root
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleAddClick}>
            {activeTab === 'users' ? 'Add user' : 'Add role'}
          </Button>
        </Flex>

        <Tabs.Content value="users">
          <Users
            search={search}
            addOpen={addUserOpen}
            onAddOpenChange={setAddUserOpen}
          />
        </Tabs.Content>
        <Tabs.Content value="roles">
          <Roles
            search={search}
            addOpen={addRoleOpen}
            onAddOpenChange={setAddRoleOpen}
          />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
