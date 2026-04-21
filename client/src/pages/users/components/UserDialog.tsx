import { useEffect, useState } from 'react'
import { Text, TextField, Select } from '@radix-ui/themes'
import { useUsers } from '../hooks/useUsers'
import { useRoles } from '../../roles/hooks/useRoles'
import { useToast } from '../../../components/ToastProvider'
import FormDialog from '../../../components/FormDialog'
import type { User } from '../../../types/api'

interface Props {
  open: boolean
  user: User | null
  onClose: () => void
}

const EMPTY = { first: '', last: '', roleId: '' }

export default function UserDialog({ open, user, onClose }: Props) {
  const { addUser, editUser } = useUsers()
  const { data: roles } = useRoles()
  const showToast = useToast()
  const [form, setForm] = useState(EMPTY)

  const isEditing = user !== null
  const mutation = isEditing ? editUser : addUser

  useEffect(() => {
    if (open) setForm(user ? { first: user.first, last: user.last, roleId: user.roleId } : EMPTY)
  }, [open, user])

  const set = (field: keyof typeof form) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleClose = () => {
    onClose()
    mutation.reset()
  }

  const handleSubmit = () => {
    if (isEditing) {
      editUser.mutate({ id: user.id, ...form }, {
        onSuccess: () => { showToast({ title: 'Changes saved' }); handleClose() },
      })
    } else {
      addUser.mutate(form, {
        onSuccess: () => { showToast({ title: `${form.first} ${form.last} added` }); handleClose() },
      })
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={open => { if (!open) handleClose() }}
      title={isEditing ? 'Edit user' : 'Add user'}
      error={mutation.error?.message}
      submitLabel={isEditing ? 'Save changes' : 'Add user'}
      onSubmit={handleSubmit}
      submitDisabled={!form.first || !form.last || !form.roleId}
      submitLoading={mutation.isPending}
    >
      <label>
        <Text as="div" size="2" mb="1" weight="medium">First name</Text>
        <TextField.Root value={form.first} onChange={e => set('first')(e.target.value)} placeholder="First name" />
      </label>
      <label>
        <Text as="div" size="2" mb="1" weight="medium">Last name</Text>
        <TextField.Root value={form.last} onChange={e => set('last')(e.target.value)} placeholder="Last name" />
      </label>
      <label>
        <Text as="div" size="2" mb="1" weight="medium">Role</Text>
        <Select.Root value={form.roleId} onValueChange={set('roleId')}>
          <Select.Trigger placeholder="Select a role" style={{ width: '100%' }} />
          <Select.Content>
            {roles?.map(role => (
              <Select.Item key={role.id} value={role.id}>{role.name}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </label>
    </FormDialog>
  )
}
