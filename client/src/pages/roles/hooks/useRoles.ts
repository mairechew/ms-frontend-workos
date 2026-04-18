import { useQuery } from '@tanstack/react-query'
import { fetchAllPages } from '../../../lib/api'
import type { Role } from '../../../types/api'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchAllPages<Role>('/roles', 'Failed to fetch roles'),
  })
}
