import { useEffect, useMemo, useState } from 'react'
import {
  Table, Avatar, Flex, Text, Spinner, Callout,
  Button, TextField, DropdownMenu, IconButton, Box,
} from '@radix-ui/themes'
import { PlusIcon, DotsHorizontalIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useUsers } from './hooks/useUsers'
import { useRoles } from '../roles/hooks/useRoles'
import AddUserDialog from './components/AddUserDialog'
import EditUserDialog from './components/EditUserDialog'
import Pagination from '../../components/Pagination'
import type { User } from '../../types/api'

const PAGE_SIZE = 10

interface Props {
  compact: boolean
}

export default function Users({ compact }: Props) {
  const { data, isLoading, isError, deleteUser } = useUsers()
  const { data: roles } = useRoles()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => setPage(1), [search])

  const roleMap = useMemo(
    () => new Map(roles?.map(r => [r.id, r]) ?? []),
    [roles]
  )

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.toLowerCase()
    if (!q) return data
    return data.filter(
      u => u.first.toLowerCase().includes(q) || u.last.toLowerCase().includes(q)
    )
  }, [data, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (isLoading) return <Flex justify="center" p="8"><Spinner size="3" /></Flex>
  if (isError) return (
    <Callout.Root color="red" mt="4">
      <Callout.Text>Failed to load users. Please try again.</Callout.Text>
    </Callout.Root>
  )

  return (
    <>
      <Flex gap="3" align="center" mt="4" mb="4">
        <TextField.Root
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon /> Add user
        </Button>
      </Flex>

      <Box style={{ border: '1px solid var(--gray-a5)', borderRadius: 'var(--radius-3)', overflow: 'hidden' }}>
        <Table.Root size={compact ? '1' : '2'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginated.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Flex justify="center" py="8">
                    <Text color="gray" size="2">
                      {search ? `No users match "${search}"` : 'No users yet'}
                    </Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )}
            {paginated.map(user => (
              <Table.Row key={user.id}>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    {!compact && <Avatar src={user.photo} fallback={user.first[0]} size="1" radius="full" />}
                    <Text>{user.first} {user.last}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>{roleMap.get(user.roleId)?.name ?? '—'}</Table.Cell>
                <Table.Cell>{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Table.Cell>
                <Table.Cell justify="end">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton variant="ghost" color="gray" size="1" aria-label="More options">
                        <DotsHorizontalIcon />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item onClick={() => setEditingUser(user)}>Edit user</DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item color="red" onClick={() => deleteUser.mutate(user.id)}>Delete user</DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Box>

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditUserDialog user={editingUser} onClose={() => setEditingUser(null)} />
    </>
  )
}
