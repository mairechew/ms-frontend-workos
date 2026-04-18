import { useMemo, useState } from 'react'
import {
  Table, Avatar, Badge, Flex, Text, Spinner,
  Callout, Dialog, Button, TextField, Select,
} from '@radix-ui/themes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUsers } from './hooks/useUsers'
import { useRoles } from '../roles/hooks/useRoles'
import { API_BASE } from '../../config'

interface Props {
  search: string
  addOpen: boolean
  onAddOpenChange: (open: boolean) => void
}

export default function Users({ search, addOpen, onAddOpenChange }: Props) {
  const queryClient = useQueryClient()
  const usersQuery = useUsers()
  const rolesQuery = useRoles()

  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [roleId, setRoleId] = useState('')

  const roleMap = useMemo(
    () => new Map(rolesQuery.data?.map(r => [r.id, r]) ?? []),
    [rolesQuery.data]
  )

  const filtered = useMemo(() => {
    if (!usersQuery.data) return []
    const q = search.toLowerCase()
    if (!q) return usersQuery.data
    return usersQuery.data.filter(
      u => u.first.toLowerCase().includes(q) || u.last.toLowerCase().includes(q)
    )
  }, [usersQuery.data, search])

  const addUser = useMutation({
    mutationFn: (body: { first: string; last: string; roleId: string }) =>
      fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => {
        if (!r.ok) throw new Error('Failed to add user')
        return r.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onAddOpenChange(false)
      setFirst('')
      setLast('')
      setRoleId('')
    },
  })

  if (usersQuery.isLoading) {
    return (
      <Flex justify="center" p="8">
        <Spinner size="3" />
      </Flex>
    )
  }

  if (usersQuery.isError) {
    return (
      <Callout.Root color="red" mt="4">
        <Callout.Text>Failed to load users. Please try again.</Callout.Text>
      </Callout.Root>
    )
  }

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filtered.map(user => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <Flex align="center" gap="2">
                  <Avatar
                    src={user.photo}
                    fallback={user.first[0]}
                    size="1"
                    radius="full"
                  />
                  <Text>{user.first} {user.last}</Text>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                {roleMap.get(user.roleId)?.name ?? '—'}
              </Table.Cell>
              <Table.Cell>
                {new Date(user.createdAt).toLocaleDateString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Dialog.Root open={addOpen} onOpenChange={onAddOpenChange}>
        <Dialog.Content size="4" maxWidth="480px">
          <Dialog.Title>Add user</Dialog.Title>
          <Flex direction="column" gap="4" mt="4">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">First name</Text>
              <TextField.Root
                value={first}
                onChange={e => setFirst(e.target.value)}
                placeholder="First name"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">Last name</Text>
              <TextField.Root
                value={last}
                onChange={e => setLast(e.target.value)}
                placeholder="Last name"
              />
            </label>
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">Role</Text>
              <Select.Root value={roleId} onValueChange={setRoleId}>
                <Select.Trigger placeholder="Select a role" />
                <Select.Content>
                  {rolesQuery.data?.map(role => (
                    <Select.Item key={role.id} value={role.id}>
                      {role.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
            {addUser.isError && (
              <Callout.Root color="red">
                <Callout.Text>Failed to add user. Please try again.</Callout.Text>
              </Callout.Root>
            )}
            <Flex gap="3" justify="end" mt="2">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button
                onClick={() => addUser.mutate({ first, last, roleId })}
                disabled={!first || !last || !roleId}
                loading={addUser.isPending}
              >
                Add user
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
