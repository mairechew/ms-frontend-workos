import { useEffect, useState } from 'react'
import { Dialog, Button, Flex, Text, TextField, Checkbox, Callout } from '@radix-ui/themes'
import { useRoles } from '../hooks/useRoles'
import type { Role } from '../../../types/api'

interface Props {
  role: Role | null
  onClose: () => void
}

export default function EditRoleDialog({ role, onClose }: Props) {
  const { editRole } = useRoles()

  const [form, setForm] = useState({ name: '', description: '', isDefault: false })

  useEffect(() => {
    if (role) setForm({ name: role.name, description: role.description ?? '', isDefault: role.isDefault })
  }, [role])

  const set = (field: keyof typeof form) => (value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  function handleClose() {
    onClose()
    editRole.reset()
  }

  return (
    <Dialog.Root open={role !== null} onOpenChange={open => { if (!open) handleClose() }}>
      <Dialog.Content size="4" maxWidth="480px">
        <Dialog.Title>Edit role</Dialog.Title>
        <Flex direction="column" gap="4" mt="4">
          <label>
            <Text as="div" size="2" mb="1" weight="medium">Name</Text>
            <TextField.Root value={form.name} onChange={e => set('name')(e.target.value)} placeholder="Role name" />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="medium">Description</Text>
            <TextField.Root value={form.description} onChange={e => set('description')(e.target.value)} placeholder="Optional description" />
          </label>
          <Text as="label" size="2" weight="medium">
            <Flex gap="2" align="center">
              <Checkbox
                checked={form.isDefault}
                disabled={role?.isDefault}
                onCheckedChange={c => set('isDefault')(c === true)}
              />
              Set as default role
            </Flex>
          </Text>
          {editRole.isError && (
            <Callout.Root color="red">
              <Callout.Text>{editRole.error?.message}</Callout.Text>
            </Callout.Root>
          )}
          <Flex gap="3" justify="end" mt="2">
            <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
            <Button
              onClick={() => editRole.mutate({ id: role!.id, ...form }, { onSuccess: handleClose })}
              disabled={!form.name}
              loading={editRole.isPending}
            >
              Save changes
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
