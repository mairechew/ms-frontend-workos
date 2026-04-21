import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAllPages, apiFetch } from '../../../lib/api'
import { UNDO_DELAY, STALE_TIME } from '../../../lib/constants'
import type { Role } from '../../../types/api'

export function useRoles() {
  const queryClient = useQueryClient()
  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey: ['roles'] }), [queryClient])

  const query = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchAllPages<Role>('/roles', 'Failed to fetch roles'),
    staleTime: STALE_TIME,
  })

  const addRole = useMutation({
    mutationFn: (body: { name: string; description: string; isDefault: boolean }) =>
      apiFetch<Role>('/roles', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })

  const editRole = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name: string; description: string; isDefault: boolean }) =>
      apiFetch(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })

  const scheduleDelete = useCallback((id: string, onError?: () => void): (() => void) => {
    queryClient.cancelQueries({ queryKey: ['roles'] })
    const previous = queryClient.getQueryData<Role[]>(['roles'])
    queryClient.setQueryData<Role[]>(['roles'], old => old?.filter(r => r.id !== id) ?? [])

    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      try {
        await apiFetch(`/roles/${id}`, { method: 'DELETE' })
        queryClient.invalidateQueries({ queryKey: ['roles'] })
      } catch {
        if (previous) queryClient.setQueryData(['roles'], previous)
        onError?.()
      }
    }, UNDO_DELAY)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (previous) queryClient.setQueryData(['roles'], previous)
    }
  }, [queryClient])

  return { ...query, addRole, editRole, scheduleDelete }
}
