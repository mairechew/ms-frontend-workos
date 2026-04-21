import { useCallback, useMemo, useState } from 'react'
import { Flex, Callout, Avatar, Text } from '@radix-ui/themes'
import { useUsers } from './hooks/useUsers'
import { useRoles } from '../roles/hooks/useRoles'
import { useToast } from '../../components/ToastProvider'
import DataTable, { type Column } from '../../components/DataTable'
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog'
import { TABLE_PARAMS } from '../../lib/constants'
import UserDialog from './components/UserDialog'
import type { User } from '../../types/api'

export default function Users() {
  const { data, isLoading, isError, scheduleDelete } = useUsers()
  const { data: roles } = useRoles()
  const showToast = useToast()
  const [dialog, setDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)

  const roleMap = useMemo(() => new Map(roles?.map(r => [r.id, r]) ?? []), [roles])

  const getSearchText = useCallback((u: User) => `${u.first} ${u.last}`, [])

  const handleDelete = (user: User) => {
    const undo = scheduleDelete(user.id, () => {
      showToast({ title: `Could not delete ${user.first} ${user.last}` })
    })
    showToast({
      title: `${user.first} ${user.last} deleted`,
      action: { label: 'Undo', onClick: undo },
    })
  }

  const columns = useMemo<Column<User>[]>(() => [
    {
      label: 'User',
      sortKey: 'name',
      sortValue: u => `${u.first} ${u.last}`,
      render: (u, compact) => (
        <Flex align="center" gap="2">
          {!compact && <Avatar src={u.photo} fallback={u.first[0]} size="1" radius="full" />}
          <Text>{u.first} {u.last}</Text>
        </Flex>
      ),
    },
    {
      label: 'Role',
      sortKey: 'role',
      sortValue: u => roleMap.get(u.roleId)?.name ?? '',
      render: u => roleMap.get(u.roleId)?.name ?? '—',
    },
    {
      label: 'Joined',
      sortKey: 'joined',
      sortValue: u => u.createdAt,
      render: u => new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  ], [roleMap])

  if (isError) return (
    <Callout.Root color="red" mt="4">
      <Callout.Text>Failed to load users. Please try again.</Callout.Text>
    </Callout.Root>
  )

  return (
    <>
      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        getSearchText={getSearchText}
        onEdit={user => setDialog({ open: true, user })}
        onDelete={setConfirmDelete}
        onAdd={() => setDialog({ open: true, user: null })}
        addLabel="Add user"
        entityLabel="user"
        searchPlaceholder="Search by name..."
        emptyMessage="No users yet"
        paramPrefix={TABLE_PARAMS.users}
      />
      <ConfirmDeleteDialog
        open={confirmDelete !== null}
        onOpenChange={open => { if (!open) setConfirmDelete(null) }}
        title="Delete user"
        description={<>Are you sure? The user <Text weight="bold">{confirmDelete?.first} {confirmDelete?.last}</Text> will be permanently deleted.</>}
        confirmLabel="Delete user"
        onConfirm={() => { if (confirmDelete) { handleDelete(confirmDelete); setConfirmDelete(null) } }}
      />
      <UserDialog
        open={dialog.open}
        user={dialog.user}
        onClose={() => setDialog({ open: false, user: null })}
      />
    </>
  )
}
