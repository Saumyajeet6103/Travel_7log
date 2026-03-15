import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOtpToken extends Document {
  userId: mongoose.Types.ObjectId
  otpHash: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

const OtpTokenSchema = new Schema<IOtpToken>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    otpHash:   { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used:      { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Auto-delete expired tokens from DB
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const OtpToken: Model<IOtpToken> =
  mongoose.models.OtpToken ?? mongoose.model<IOtpToken>('OtpToken', OtpTokenSchema)

export default OtpToken
