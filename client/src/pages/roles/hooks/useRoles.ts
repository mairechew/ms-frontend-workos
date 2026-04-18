import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAllPages, apiFetch } from '../../../lib/api'
import type { Role } from '../../../types/api'

export function useRoles() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['roles'] })

  const query = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchAllPages<Role>('/roles', 'Failed to fetch roles'),
  })

  const addRole = useMutation({
    mutationFn: (body: { name: string; description: string; isDefault: boolean }) =>
      apiFetch('/roles', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })

  const editRole = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name: string; description: string; isDefault: boolean }) =>
      apiFetch(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })

  const deleteRole = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/roles/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return { ...query, addRole, editRole, deleteRole }
}
