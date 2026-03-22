import webpush from 'web-push'
import { connectDB } from './db'
import PushSubscription from './models/PushSubscription'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@7log.app'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
}

interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Send push notification to all subscribers (or specific members)
 */
export async function sendPushToAll(payload: PushPayload, excludeMember?: string) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return

  await connectDB()
  const query = excludeMember
    ? { memberName: { $ne: excludeMember } }
    : {}
  const subs = await PushSubscription.find(query).lean()

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          sub.subscription as webpush.PushSubscription,
          JSON.stringify(payload)
        )
      } catch (err: unknown) {
        // Remove invalid/expired subscriptions
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id })
        }
      }
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return { sent, total: subs.length }
}
