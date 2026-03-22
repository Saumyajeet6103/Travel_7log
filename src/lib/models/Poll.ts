import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPollOption {
  text: string
  votes: string[]  // array of member names who voted
}

export interface IPoll extends Document {
  question: string
  options: IPollOption[]
  createdBy: string       // member name
  allowMultiple: boolean  // allow voting for multiple options
  isAnonymous: boolean
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const PollOptionSchema = new Schema<IPollOption>(
  {
    text:  { type: String, required: true, trim: true },
    votes: { type: [String], default: [] },
  },
  { _id: false }
)

const PollSchema = new Schema<IPoll>(
  {
    question:      { type: String, required: true, trim: true },
    options:       { type: [PollOptionSchema], required: true },
    createdBy:     { type: String, required: true },
    allowMultiple: { type: Boolean, default: false },
    isAnonymous:   { type: Boolean, default: false },
    expiresAt:     { type: Date, default: null },
  },
  { timestamps: true }
)

PollSchema.index({ createdAt: -1 })

const Poll: Model<IPoll> =
  mongoose.models.Poll ?? mongoose.model<IPoll>('Poll', PollSchema)

export default Poll
