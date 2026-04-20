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
    mutationFn: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['users'] })
      const previous = queryClient.getQueryData<User[]>(['users'])
      // optimistic delete
      queryClient.setQueryData<User[]>(['users'], old => old?.filter(u => u.id !== id) ?? [])
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['users'], context.previous)
    },
    onSettled: invalidate,
  })

  return { ...query, addUser, editUser, deleteUser }
}
