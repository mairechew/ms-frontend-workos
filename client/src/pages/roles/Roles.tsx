import { useEffect, useMemo, useState } from 'react'
import {
  Table, Badge, Flex, Text, Spinner, Callout,
  Button, TextField, DropdownMenu, IconButton, Box,
} from '@radix-ui/themes'
import { PlusIcon, DotsHorizontalIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useRoles } from './hooks/useRoles'
import AddRoleDialog from './components/AddRoleDialog'
import EditRoleDialog from './components/EditRoleDialog'
import Pagination from '../../components/Pagination'
import type { Role } from '../../types/api'

const PAGE_SIZE = 10

interface Props {
  compact: boolean
}

export default function Roles({ compact }: Props) {
  const { data, isLoading, isError, deleteRole } = useRoles()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  useEffect(() => setPage(1), [search])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.toLowerCase()
    if (!q) return data
    return data.filter(
      r => r.name.toLowerCase().includes(q) || (r.description?.toLowerCase().includes(q) ?? false)
    )
  }, [data, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (isLoading) return <Flex justify="center" p="8"><Spinner size="3" /></Flex>
  if (isError) return (
    <Callout.Root color="red" mt="4">
      <Callout.Text>Failed to load roles. Please try again.</Callout.Text>
    </Callout.Root>
  )

  return (
    <>
      <Flex gap="3" align="center" mt="4" mb="4">
        <TextField.Root
          placeholder="Search by name or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon /> Add role
        </Button>
      </Flex>

      <Box style={{ border: '1px solid var(--gray-a5)', borderRadius: 'var(--radius-3)', overflow: 'hidden' }}>
        <Table.Root size={compact ? '1' : '2'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginated.map(role => (
              <Table.Row key={role.id}>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <Text>{role.name}</Text>
                    {role.isDefault && <Badge color="green">Default</Badge>}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text color="gray">{role.description ?? '—'}</Text>
                </Table.Cell>
                <Table.Cell>{new Date(role.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Table.Cell>
                <Table.Cell justify="end">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton variant="ghost" color="gray" size="1" aria-label="More options">
                        <DotsHorizontalIcon />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item onClick={() => setEditingRole(role)}>Edit role</DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item color="red" disabled={role.isDefault} onClick={() => deleteRole.mutate(role.id)}>
                        Delete role
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Box>

      <AddRoleDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditRoleDialog role={editingRole} onClose={() => setEditingRole(null)} />
    </>
  )
}
