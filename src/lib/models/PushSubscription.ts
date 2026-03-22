import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPushSubscription extends Document {
  memberName: string
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    memberName:   { type: String, required: true },
    subscription: {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth:   { type: String, required: true },
      },
    },
  },
  { timestamps: true }
)

PushSubscriptionSchema.index({ memberName: 1 })
PushSubscriptionSchema.index({ 'subscription.endpoint': 1 }, { unique: true })

const PushSubscription: Model<IPushSubscription> =
  mongoose.models.PushSubscription ?? mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema)

export default PushSubscription
