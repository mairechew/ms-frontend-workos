import { API_BASE } from '../config'
import type { PagedData } from '../types/api'

export async function apiFetch<T = unknown>(route: string, options?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${route}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!r.ok) {
    const body = await r.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed: ${r.status}`)
  }
  return r.json()
}

export async function fetchAllPages<T>(route: string, errorMessage: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}${route}`)
  if (!res.ok) throw new Error(errorMessage)
  const first: PagedData<T> = await res.json()

  if (first.pages <= 1) return first.data

  const rest = await Promise.all(
    Array.from({ length: first.pages - 1 }, (_, i) =>
      fetch(`${API_BASE}${route}?page=${i + 2}`).then(r => {
        if (!r.ok) throw new Error(errorMessage)
        return r.json() as Promise<PagedData<T>>
      })
    )
  )

  return [...first.data, ...rest.flatMap(p => p.data)]
}
