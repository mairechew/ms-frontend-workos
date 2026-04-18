import { useState } from 'react'
import { Dialog, Button, Flex, Text, TextField, Checkbox, Callout } from '@radix-ui/themes'
import { useRoles } from '../hooks/useRoles'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AddRoleDialog({ open, onClose }: Props) {
  const { addRole } = useRoles()

  const [form, setForm] = useState({ name: '', description: '', isDefault: false })

  const set = (field: keyof typeof form) => (value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  function handleClose() {
    onClose()
    setForm({ name: '', description: '', isDefault: false })
    addRole.reset()
  }

  return (
    <Dialog.Root open={open} onOpenChange={open => { if (!open) handleClose() }}>
      <Dialog.Content size="4" maxWidth="480px">
        <Dialog.Title>Add role</Dialog.Title>
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
                onCheckedChange={c => set('isDefault')(c === true)}
              />
              Set as default role
            </Flex>
          </Text>
          {addRole.isError && (
            <Callout.Root color="red">
              <Callout.Text>{addRole.error?.message}</Callout.Text>
            </Callout.Root>
          )}
          <Flex gap="3" justify="end" mt="2">
            <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
            <Button
              onClick={() => addRole.mutate(form, { onSuccess: handleClose })}
              disabled={!form.name}
              loading={addRole.isPending}
            >
              Add role
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
