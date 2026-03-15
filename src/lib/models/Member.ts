import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMember extends Document {
  name: string
  nickname: string
  emoji: string
  color: string
  totalPaid: number
  totalOwed: number
  createdAt: Date
  updatedAt: Date
}

const MemberSchema = new Schema<IMember>(
  {
    name:      { type: String, required: true, unique: true, trim: true },
    nickname:  { type: String, default: '' },           // Admin-only editable
    emoji:     { type: String, default: '🧑' },         // Admin-only editable
    color:     { type: String, default: '#52B788' },
    totalPaid: { type: Number, default: 0 },
    totalOwed: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Member: Model<IMember> =
  mongoose.models.Member ?? mongoose.model<IMember>('Member', MemberSchema)

export default Member
