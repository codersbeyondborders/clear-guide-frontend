'use client'

import useSWR from 'swr'
import type { ManualListItem } from '@/lib/types'
import { apiClient } from '@/lib/apiClient'

const fetcher = async (url: string) => {
  const r = await apiClient.get(url)
  return r.data
}

export function useManuals(status?: string) {
  const key = status && status !== 'all'
    ? `/manuals?status=${encodeURIComponent(status)}`
    : '/manuals'

  const { data, error, isLoading, mutate } = useSWR<ManualListItem[]>(
    key,
    fetcher,
    {
      refreshInterval: 30_000,
      dedupingInterval: 10_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
    },
  )

  const deleteManual = async (id: string) => {
    // Optimistic update
    mutate((prev) => prev?.filter((m) => m.id !== id), false)
    await apiClient.delete(`/manuals/${id}`)
    mutate()
  }

  const createManual = async (body: object): Promise<ManualListItem | null> => {
    try {
      const res = await apiClient.post('/manuals', body)
      const newManual = res.data as ManualListItem
      mutate((prev) => [newManual, ...(prev ?? [])], false)
      return newManual
    } catch {
      return null
    }
  }

  return {
    manuals: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
    deleteManual,
    createManual,
  }
}

