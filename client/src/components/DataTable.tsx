import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  Table, Flex, Text, Button, TextField,
  DropdownMenu, IconButton, Box,
} from '@radix-ui/themes'
import {
  PlusIcon, DotsHorizontalIcon, MagnifyingGlassIcon,
  ArrowUpIcon, ArrowDownIcon, CaretSortIcon,
  DashboardIcon, HamburgerMenuIcon,
} from '@radix-ui/react-icons'
import Pagination from './Pagination'

export interface Column<T> {
  label: string
  sortKey?: string
  sortValue?: (item: T) => string
  render: (item: T, compact: boolean) => ReactNode
}

interface Props<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  getSearchText: (item: T) => string
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onAdd: () => void
  addLabel: string
  entityLabel: string
  searchPlaceholder?: string
  emptyMessage?: string
  canDelete?: (item: T) => boolean
  paramPrefix: string
}

type SortDir = 'asc' | 'desc'
type Sort = { key: string; dir: SortDir } | null

const PAGE_SIZE = 10

const SortIndicator = ({ sortKey, sort }: { sortKey: string; sort: Sort }) => {
  if (sort?.key !== sortKey) return <CaretSortIcon style={{ opacity: 0.4 }} />
  return sort.dir === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
}

export default function DataTable<T extends { id: string }>({
  data, columns, getSearchText,
  onEdit, onDelete, onAdd, addLabel, entityLabel,
  searchPlaceholder = 'Search...', emptyMessage = 'No items yet',
  canDelete = () => true, paramPrefix,
}: Props<T>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [compact, setCompact] = useState(false)

  const qKey = `${paramPrefix}_q`
  const sortKey = `${paramPrefix}_sort`
  const dirKey = `${paramPrefix}_dir`
  const pageKey = `${paramPrefix}_page`

  const search = searchParams.get(qKey) ?? ''
  const sortField = searchParams.get(sortKey)
  const sortDir = searchParams.get(dirKey) as SortDir | null
  const sort: Sort = sortField && sortDir ? { key: sortField, dir: sortDir } : null
  const page = Math.max(1, parseInt(searchParams.get(pageKey) ?? '1', 10))

  const setSearch = (q: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (q) next.set(qKey, q)
      else next.delete(qKey)
      next.delete(pageKey)
      return next
    }, { replace: true })
  }

  const handleSort = (key: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      const prevKey = next.get(sortKey)
      const prevDir = next.get(dirKey) as SortDir | null

      if (!prevKey || prevKey !== key) {
        next.set(sortKey, key)
        next.set(dirKey, 'asc')
      } else if (prevDir === 'asc') {
        next.set(dirKey, 'desc')
      } else {
        next.delete(sortKey)
        next.delete(dirKey)
      }
      next.delete(pageKey)
      return next
    })
  }

  const setPage = (p: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (p === 1) next.delete(pageKey)
      else next.set(pageKey, String(p))
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return data
    return data.filter(item => getSearchText(item).toLowerCase().includes(q))
  }, [data, search, getSearchText])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const col = columns.find(c => c.sortKey === sort.key)
    const { sortValue } = col ?? {}
    if (!sortValue) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = sortValue(a)
      const bVal = sortValue(b)
      return sort.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  }, [filtered, sort, columns])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <Flex gap="2" align="center" mt="5" mb="5">
        <TextField.Root
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        >
          <TextField.Slot><MagnifyingGlassIcon /></TextField.Slot>
        </TextField.Root>
        <Button onClick={onAdd}><PlusIcon /> {addLabel}</Button>
      </Flex>

      <Box style={{ border: 'var(--border-subtle)', borderRadius: 'var(--radius-3)', overflow: 'hidden' }}>
        <Table.Root size={compact ? '1' : '2'}>
          <Table.Header style={{ background: 'var(--table-header-bg)'}}>
            <Table.Row>
              {columns.map(col => (
                col.sortKey ? (
                  <Table.ColumnHeaderCell
                    key={col.label}
                    onClick={() => handleSort(col.sortKey!)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <Flex align="center" gap="1">
                      {col.label} <SortIndicator sortKey={col.sortKey} sort={sort} />
                    </Flex>
                  </Table.ColumnHeaderCell>
                ) : (
                  <Table.ColumnHeaderCell key={col.label}>{col.label}</Table.ColumnHeaderCell>
                )
              ))}
              <Table.ColumnHeaderCell justify="end">
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="1"
                  aria-label="Toggle density"
                  onClick={() => setCompact(c => !c)}
                >
                  {compact ? <HamburgerMenuIcon /> : <DashboardIcon />}
                </IconButton>
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginated.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <Flex justify="center" py="8">
                    <Text color="gray" size="2">
                      {search ? `No ${entityLabel}s match "${search}"` : emptyMessage}
                    </Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )}
            {paginated.map(item => (
              <Table.Row key={item.id}>
                {columns.map(col => (
                  <Table.Cell key={col.label}>{col.render(item, compact)}</Table.Cell>
                ))}
                <Table.Cell justify="end">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton variant="ghost" color="gray" size="1" aria-label="More options" radius='full'>
                        <DotsHorizontalIcon />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item onClick={() => onEdit(item)}>
                        Edit {entityLabel}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        disabled={!canDelete(item)}
                        onClick={() => onDelete(item)}
                      >
                        Delete {entityLabel}
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
