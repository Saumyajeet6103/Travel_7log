import Ably from 'ably'

let client: Ably.Rest | null = null

function getClient(): Ably.Rest {
  if (!client) {
    if (!process.env.ABLY_API_KEY) {
      throw new Error('ABLY_API_KEY not set')
    }
    client = new Ably.Rest(process.env.ABLY_API_KEY)
  }
  return client
}

const CHANNEL = '7log'

export type RealtimeEvent = 'expense' | 'spot' | 'packing' | 'settlement'

export async function publishEvent(event: RealtimeEvent, data?: unknown): Promise<void> {
  try {
    await getClient().channels.get(CHANNEL).publish(event, data ?? {})
  } catch (err) {
    // Don't let a publish failure break the main API response
    console.warn('[ably] publish failed:', err)
  }
}
