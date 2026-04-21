import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useUsers } from './useUsers'
import type { User } from '../../../types/api'

vi.mock('../../../lib/api', () => ({
  fetchAllPages: vi.fn().mockResolvedValue([]),
  apiFetch: vi.fn().mockResolvedValue({}),
}))

import { apiFetch } from '../../../lib/api'

const mockUser: User = {
  id: 'user-1',
  first: 'Jane',
  last: 'Doe',
  roleId: 'role-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
}

describe('useUsers — scheduleDelete', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => { vi.useRealTimers(); vi.clearAllMocks() })

  it('optimistically removes the user from cache immediately', () => {
    const queryClient = makeClient()
    queryClient.setQueryData(['users'], [mockUser])

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper(queryClient) })

    act(() => { result.current.scheduleDelete('user-1') })

    expect(queryClient.getQueryData(['users'])).toEqual([])
  })

  it('calls the API after the undo delay expires', async () => {
    const queryClient = makeClient()
    queryClient.setQueryData(['users'], [mockUser])

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper(queryClient) })

    act(() => { result.current.scheduleDelete('user-1') })
    expect(apiFetch).not.toHaveBeenCalled()

    await act(async () => { vi.runAllTimers() })

    expect(apiFetch).toHaveBeenCalledWith('/users/user-1', { method: 'DELETE' })
  })

  it('does not call the API when undo is triggered before the delay', async () => {
    const queryClient = makeClient()
    queryClient.setQueryData(['users'], [mockUser])

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper(queryClient) })

    let undo!: () => void
    act(() => { undo = result.current.scheduleDelete('user-1') })
    act(() => { undo() })

    await act(async () => { vi.runAllTimers() })

    expect(apiFetch).not.toHaveBeenCalled()
  })

  it('restores the cache when undo is triggered', () => {
    const queryClient = makeClient()
    queryClient.setQueryData(['users'], [mockUser])

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper(queryClient) })

    let undo!: () => void
    act(() => { undo = result.current.scheduleDelete('user-1') })
    expect(queryClient.getQueryData(['users'])).toEqual([])

    act(() => { undo() })
    expect(queryClient.getQueryData(['users'])).toEqual([mockUser])
  })

  it('restores the cache and calls onError when the API call fails', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Server error'))

    const queryClient = makeClient()
    queryClient.setQueryData(['users'], [mockUser])
    const onError = vi.fn()

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper(queryClient) })

    act(() => { result.current.scheduleDelete('user-1', onError) })

    await act(async () => { vi.runAllTimers() })
    await act(async () => {}) // flush rejected promise

    expect(queryClient.getQueryData(['users'])).toEqual([mockUser])
    expect(onError).toHaveBeenCalledOnce()
  })
})
