import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAllPages, apiFetch } from '../../../lib/api'
import type { User } from '../../../types/api'

export function useUsers() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const query = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchAllPages<User>('/users', 'Failed to fetch users'),
  })

  const addUser = useMutation({
    mutationFn: (body: { first: string; last: string; roleId: string }) =>
      apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })

  const editUser = useMutation({
    mutationFn: ({ id, ...body }: { id: string; first: string; last: string; roleId: string }) =>
      apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return { ...query, addUser, editUser, deleteUser }
}
