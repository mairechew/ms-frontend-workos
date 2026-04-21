import { useSearchParams } from 'react-router-dom'

type SortDir = 'asc' | 'desc'
export type Sort = { key: string; dir: SortDir } | null

export function useTableParams(prefix: string) {
  const [searchParams, setSearchParams] = useSearchParams()

  const qKey = `${prefix}_q`
  const sortKey = `${prefix}_sort`
  const dirKey = `${prefix}_dir`
  const pageKey = `${prefix}_page`

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

  return { search, sort, page, setSearch, handleSort, setPage }
}
