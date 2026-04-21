import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAllPages } from './api'

vi.mock('../config', () => ({ API_BASE: 'http://test' }))

const mockFetch = vi.fn()
globalThis.fetch = mockFetch as unknown as typeof fetch

function makePageResponse(data: unknown[], pages: number) {
  return { ok: true, json: async () => ({ data, pages, next: null, prev: null }) }
}

describe('fetchAllPages', () => {
  beforeEach(() => mockFetch.mockReset())

  it('returns data from a single page', async () => {
    mockFetch.mockResolvedValueOnce(makePageResponse([{ id: '1' }], 1))

    const result = await fetchAllPages('/items', 'error')

    expect(result).toEqual([{ id: '1' }])
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('fetches remaining pages in parallel when multiple pages exist', async () => {
    mockFetch
      .mockResolvedValueOnce(makePageResponse([{ id: '1' }], 3))
      .mockResolvedValueOnce(makePageResponse([{ id: '2' }], 3))
      .mockResolvedValueOnce(makePageResponse([{ id: '3' }], 3))

    const result = await fetchAllPages('/items', 'error')

    expect(result).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }])
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(mockFetch).toHaveBeenCalledWith('http://test/items?page=2')
    expect(mockFetch).toHaveBeenCalledWith('http://test/items?page=3')
  })

  it('throws with the provided message when the first request fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    await expect(fetchAllPages('/items', 'Failed to load')).rejects.toThrow('Failed to load')
  })

  it('throws when a subsequent page request fails', async () => {
    mockFetch
      .mockResolvedValueOnce(makePageResponse([{ id: '1' }], 2))
      .mockResolvedValueOnce({ ok: false })

    await expect(fetchAllPages('/items', 'Failed to load')).rejects.toThrow('Failed to load')
  })
})
