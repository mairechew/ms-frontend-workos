import { useEffect, useState } from 'react'
import { Text, TextField, Checkbox, Flex } from '@radix-ui/themes'
import { useRoles } from '../hooks/useRoles'
import { useToast } from '../../../components/ToastProvider'
import FormDialog from '../../../components/FormDialog'
import type { Role } from '../../../types/api'

interface Props {
  open: boolean
  role: Role | null
  onClose: () => void
}

const EMPTY = { name: '', description: '', isDefault: false }

export default function RoleDialog({ open, role, onClose }: Props) {
  const { addRole, editRole } = useRoles()
  const showToast = useToast()
  const [form, setForm] = useState(EMPTY)

  const isEditing = role !== null
  const mutation = isEditing ? editRole : addRole

  useEffect(() => {
    if (open) setForm(role ? { name: role.name, description: role.description ?? '', isDefault: role.isDefault } : EMPTY)
  }, [open, role])

  const set = (field: keyof typeof form) => (value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleClose = () => {
    onClose()
    mutation.reset()
  }

  const handleSubmit = () => {
    if (isEditing) {
      editRole.mutate({ id: role.id, ...form }, {
        onSuccess: () => { showToast({ title: 'Changes saved' }); handleClose() },
      })
    } else {
      addRole.mutate(form, {
        onSuccess: () => { showToast({ title: `"${form.name}" role added` }); handleClose() },
      })
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={open => { if (!open) handleClose() }}
      title={isEditing ? 'Edit role' : 'Add role'}
      error={mutation.error?.message}
      submitLabel={isEditing ? 'Save changes' : 'Add role'}
      onSubmit={handleSubmit}
      submitDisabled={!form.name}
      submitLoading={mutation.isPending}
    >
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
    </FormDialog>
  )
}
