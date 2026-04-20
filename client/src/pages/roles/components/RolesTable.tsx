import { useEffect, useMemo, useState } from 'react'
import {
  Table, Badge, Flex, Text, Button, TextField,
  DropdownMenu, IconButton, Box,
} from '@radix-ui/themes'
import {
  PlusIcon, DotsHorizontalIcon, MagnifyingGlassIcon,
  ArrowUpIcon, ArrowDownIcon, CaretSortIcon,
} from '@radix-ui/react-icons'
import Pagination from '../../../components/Pagination'
import type { Role } from '../../../types/api'

type SortField = 'name' | 'description' | 'created'
type SortDir = 'asc' | 'desc'
type Sort = { field: SortField; dir: SortDir } | null

interface Props {
  data: Role[]
  compact: boolean
  onEdit: (role: Role) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

const PAGE_SIZE = 10

function SortIndicator({ field, sort }: { field: SortField; sort: Sort }) {
  if (sort?.field !== field) return <CaretSortIcon style={{ opacity: 0.4 }} />
  return sort.dir === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
}

export default function RolesTable({ data, compact, onEdit, onDelete, onAdd }: Props) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>(null)
  const [page, setPage] = useState(1)

  useEffect(() => setPage(1), [search, sort])

  function handleSort(field: SortField) {
    setSort(prev => {
      if (!prev || prev.field !== field) return { field, dir: 'asc' }
      if (prev.dir === 'asc') return { field, dir: 'desc' }
      return null
    })
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return data
    return data.filter(r =>
      r.name.toLowerCase().includes(q) || (r.description?.toLowerCase().includes(q) ?? false)
    )
  }, [data, search])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    return [...filtered].sort((a, b) => {
      let aVal = '', bVal = ''
      if (sort.field === 'name') { aVal = a.name; bVal = b.name }
      else if (sort.field === 'description') { aVal = a.description ?? ''; bVal = b.description ?? '' }
      else { aVal = a.createdAt; bVal = b.createdAt }
      return sort.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  }, [filtered, sort])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const headerCell = (label: string, field: SortField) => (
    <Table.ColumnHeaderCell onClick={() => handleSort(field)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <Flex align="center" gap="1">{label} <SortIndicator field={field} sort={sort} /></Flex>
    </Table.ColumnHeaderCell>
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
          <TextField.Slot><MagnifyingGlassIcon /></TextField.Slot>
        </TextField.Root>
        <Button onClick={onAdd}><PlusIcon /> Add role</Button>
      </Flex>

      <Box style={{ border: '1px solid var(--gray-a5)', borderRadius: 'var(--radius-3)', overflow: 'hidden' }}>
        <Table.Root size={compact ? '1' : '2'}>
          <Table.Header>
            <Table.Row>
              {headerCell('Role', 'name')}
              {headerCell('Description', 'description')}
              {headerCell('Created', 'created')}
              <Table.ColumnHeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginated.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Flex justify="center" py="8">
                    <Text color="gray" size="2">
                      {search ? `No roles match "${search}"` : 'No roles yet'}
                    </Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )}
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
                      <DropdownMenu.Item onClick={() => onEdit(role)}>Edit role</DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item color="red" disabled={role.isDefault} onClick={() => onDelete(role.id)}>
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
    </>
  )
}
