'use client'

import { useEffect, useRef } from 'react'
import type { RealtimeEvent } from '@/lib/ably-server'

/**
 * Subscribe to 7log real-time events via Ably.
 * `onEvent` is called whenever any update is published on the channel.
 * Safe to call with unstable function refs — internally stabilised with a ref.
 */
export function useRealtime(
  events: RealtimeEvent[],
  onEvent: (event: RealtimeEvent) => void,
) {
  const cbRef = useRef(onEvent)
  cbRef.current = onEvent

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ABLY_KEY) return // Ably not configured — skip silently

    let cancelled = false
    let realtimeClient: import('ably').Realtime | null = null

    import('ably').then(({ default: Ably }) => {
      if (cancelled) return

      realtimeClient = new Ably.Realtime({
        authUrl: '/api/ably-token',
        autoConnect: true,
      })

      const channel = realtimeClient.channels.get('7log')

      events.forEach((event) => {
        channel.subscribe(event, () => cbRef.current(event))
      })
    })

    return () => {
      cancelled = true
      realtimeClient?.channels.get('7log').unsubscribe()
      realtimeClient?.close()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
