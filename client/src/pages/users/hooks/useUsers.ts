import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAllPages, apiFetch } from '../../../lib/api'
import { UNDO_DELAY, STALE_TIME } from '../../../lib/constants'
import type { User } from '../../../types/api'

export function useUsers() {
  const queryClient = useQueryClient()
  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey: ['users'] }), [queryClient])

  const query = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchAllPages<User>('/users', 'Failed to fetch users'),
    staleTime: STALE_TIME,
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

  const scheduleDelete = useCallback((id: string, onError?: () => void): (() => void) => {
    queryClient.cancelQueries({ queryKey: ['users'] })
    const previous = queryClient.getQueryData<User[]>(['users'])
    queryClient.setQueryData<User[]>(['users'], old => old?.filter(u => u.id !== id) ?? [])

    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      try {
        await apiFetch(`/users/${id}`, { method: 'DELETE' })
        queryClient.invalidateQueries({ queryKey: ['users'] })
      } catch {
        if (previous) queryClient.setQueryData(['users'], previous)
        onError?.()
      }
    }, UNDO_DELAY)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (previous) queryClient.setQueryData(['users'], previous)
    }
  }, [queryClient])

  return { ...query, addUser, editUser, scheduleDelete }
}
