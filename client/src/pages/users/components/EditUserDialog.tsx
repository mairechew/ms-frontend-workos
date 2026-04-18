import { useEffect, useState } from 'react'
import { Dialog, Button, Flex, Text, TextField, Select, Callout } from '@radix-ui/themes'
import { useUsers } from '../hooks/useUsers'
import { useRoles } from '../../roles/hooks/useRoles'
import type { User } from '../../../types/api'

interface Props {
  user: User | null
  onClose: () => void
}

export default function EditUserDialog({ user, onClose }: Props) {
  const { editUser } = useUsers()
  const { data: roles } = useRoles()

  const [form, setForm] = useState({ first: '', last: '', roleId: '' })

  useEffect(() => {
    if (user) setForm({ first: user.first, last: user.last, roleId: user.roleId })
  }, [user])

  const set = (field: keyof typeof form) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  function handleClose() {
    onClose()
    editUser.reset()
  }

  return (
    <Dialog.Root open={user !== null} onOpenChange={open => { if (!open) handleClose() }}>
      <Dialog.Content size="4" maxWidth="480px">
        <Dialog.Title>Edit user</Dialog.Title>
        <Flex direction="column" gap="4" mt="4">
          <label>
            <Text as="div" size="2" mb="1" weight="medium">First name</Text>
            <TextField.Root value={form.first} onChange={e => set('first')(e.target.value)} placeholder="First name" />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="medium">Last name</Text>
            <TextField.Root value={form.last} onChange={e => set('last')(e.target.value)} placeholder="Last name" />
          </label>
          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">Role</Text>
            <Select.Root value={form.roleId} onValueChange={set('roleId')}>
              <Select.Trigger placeholder="Select a role" />
              <Select.Content>
                {roles?.map(role => (
                  <Select.Item key={role.id} value={role.id}>{role.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          {editUser.isError && (
            <Callout.Root color="red">
              <Callout.Text>{editUser.error?.message}</Callout.Text>
            </Callout.Root>
          )}
          <Flex gap="3" justify="end" mt="2">
            <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
            <Button
              onClick={() => editUser.mutate({ id: user!.id, ...form }, { onSuccess: handleClose })}
              disabled={!form.first || !form.last || !form.roleId}
              loading={editUser.isPending}
            >
              Save changes
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
