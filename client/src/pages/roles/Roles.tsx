import { useMemo, useState } from 'react'
import {
  Table, Badge, Flex, Text, Spinner,
  Callout, Dialog, Button, TextField, Checkbox,
} from '@radix-ui/themes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRoles } from './hooks/useRoles'
import { API_BASE } from '../../config'

interface Props {
  search: string
  addOpen: boolean
  onAddOpenChange: (open: boolean) => void
}

export default function Roles({ search, addOpen, onAddOpenChange }: Props) {
  const queryClient = useQueryClient()
  const rolesQuery = useRoles()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const filtered = useMemo(() => {
    if (!rolesQuery.data) return []
    const q = search.toLowerCase()
    if (!q) return rolesQuery.data
    return rolesQuery.data.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false)
    )
  }, [rolesQuery.data, search])

  const addRole = useMutation({
    mutationFn: (body: { name: string; description: string; isDefault: boolean }) =>
      fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => {
        if (!r.ok) throw new Error('Failed to add role')
        return r.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      onAddOpenChange(false)
      setName('')
      setDescription('')
      setIsDefault(false)
    },
  })

  if (rolesQuery.isLoading) {
    return (
      <Flex justify="center" p="8">
        <Spinner size="3" />
      </Flex>
    )
  }

  if (rolesQuery.isError) {
    return (
      <Callout.Root color="red" mt="4">
        <Callout.Text>Failed to load roles. Please try again.</Callout.Text>
      </Callout.Root>
    )
  }

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filtered.map(role => (
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
              <Table.Cell>
                {new Date(role.createdAt).toLocaleDateString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Dialog.Root open={addOpen} onOpenChange={onAddOpenChange}>
        <Dialog.Content size="4" maxWidth="480px">
          <Dialog.Title>Add role</Dialog.Title>
          <Flex direction="column" gap="4" mt="4">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">Name</Text>
              <TextField.Root
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Role name"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">Description</Text>
              <TextField.Root
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </label>
            <Text as="label" size="2" weight="medium">
              <Flex gap="2" align="center">
                <Checkbox
                  checked={isDefault}
                  onCheckedChange={checked => setIsDefault(checked === true)}
                />
                Set as default role
              </Flex>
            </Text>
            {addRole.isError && (
              <Callout.Root color="red">
                <Callout.Text>Failed to add role. Please try again.</Callout.Text>
              </Callout.Root>
            )}
            <Flex gap="3" justify="end" mt="2">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button
                onClick={() => addRole.mutate({ name, description, isDefault })}
                disabled={!name}
                loading={addRole.isPending}
              >
                Add role
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
