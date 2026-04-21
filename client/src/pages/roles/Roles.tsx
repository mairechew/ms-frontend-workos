import { useCallback, useMemo, useState } from 'react'
import { Flex, Spinner, Callout, Text, Badge } from '@radix-ui/themes'
import { useRoles } from './hooks/useRoles'
import { useToast } from '../../components/ToastProvider'
import DataTable, { type Column } from '../../components/DataTable'
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog'
import { TABLE_PARAMS } from '../../lib/constants'
import RoleDialog from './components/RoleDialog'
import type { Role } from '../../types/api'

export default function Roles() {
  const { data, isLoading, isError, scheduleDelete } = useRoles()
  const showToast = useToast()
  const [dialog, setDialog] = useState<{ open: boolean; role: Role | null }>({ open: false, role: null })
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null)

  const getSearchText = useCallback((r: Role) => `${r.name} ${r.description ?? ''}`, [])

  const handleDelete = (role: Role) => {
    const undo = scheduleDelete(role.id, () => {
      showToast({ title: `Could not delete "${role.name}"` })
    })
    showToast({
      title: `"${role.name}" deleted`,
      action: { label: 'Undo', onClick: undo },
    })
  }

  const columns = useMemo<Column<Role>[]>(() => [
    {
      label: 'Role',
      sortKey: 'name',
      sortValue: r => r.name,
      render: r => (
        <Flex align="center" gap="2">
          <Text>{r.name}</Text>
          {r.isDefault && <Badge color="green">Default</Badge>}
        </Flex>
      ),
    },
    {
      label: 'Description',
      sortKey: 'description',
      sortValue: r => r.description ?? '',
      render: r => <Text color="gray">{r.description ?? '—'}</Text>,
    },
    {
      label: 'Created',
      sortKey: 'created',
      sortValue: r => r.createdAt,
      render: r => new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  ], [])

  if (isLoading) return <Flex justify="center" p="8"><Spinner size="3" /></Flex>
  if (isError) return (
    <Callout.Root color="red" mt="4">
      <Callout.Text>Failed to load roles. Please try again.</Callout.Text>
    </Callout.Root>
  )

  return (
    <>
      <DataTable
        data={data ?? []}
        columns={columns}
        getSearchText={getSearchText}
        onEdit={role => setDialog({ open: true, role })}
        onDelete={setConfirmDelete}
        canDelete={r => !r.isDefault}
        onAdd={() => setDialog({ open: true, role: null })}
        addLabel="Add role"
        entityLabel="role"
        searchPlaceholder="Search by name or description..."
        emptyMessage="No roles yet"
        paramPrefix={TABLE_PARAMS.roles}
      />
      <ConfirmDeleteDialog
        open={confirmDelete !== null}
        onOpenChange={open => { if (!open) setConfirmDelete(null) }}
        title="Delete role"
        description={<>Are you sure? The role <Text weight="bold">{confirmDelete?.name}</Text> will be permanently deleted.</>}
        confirmLabel="Delete role"
        onConfirm={() => { if (confirmDelete) { handleDelete(confirmDelete); setConfirmDelete(null) } }}
      />
      <RoleDialog
        open={dialog.open}
        role={dialog.role}
        onClose={() => setDialog({ open: false, role: null })}
      />
    </>
  )
}
