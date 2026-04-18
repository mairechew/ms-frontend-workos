import { useQuery } from '@tanstack/react-query'
import { fetchAllPages } from '../../../lib/api'
import type { User } from '../../../types/api'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchAllPages<User>('/users', 'Failed to fetch users'),
  })
}
