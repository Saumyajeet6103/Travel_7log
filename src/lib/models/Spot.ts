import mongoose, { Schema, Document, Model } from 'mongoose'

export type SpotStatus = 'planned' | 'in-progress' | 'done' | 'skipped'
export type SpotType = 'viewpoint' | 'activity' | 'food' | 'stay' | 'travel'

export interface ISpot extends Document {
  name: string
  description: string
  type: SpotType
  day: string               // e.g. "Day 1", "Day 2", "Day 4"
  scheduledTime: string     // e.g. "5:30 AM"
  status: SpotStatus
  markedBy: string | null   // Member name who last updated status
  addedBy: string           // Member name who added this spot
  funFact: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const SpotSchema = new Schema<ISpot>(
  {
    name:          { type: String, required: true, trim: true },
    description:   { type: String, default: '', trim: true },
    type:          { type: String, enum: ['viewpoint', 'activity', 'food', 'stay', 'travel'], default: 'activity' },
    day:           { type: String, required: true },
    scheduledTime: { type: String, default: '' },
    status:        { type: String, enum: ['planned', 'in-progress', 'done', 'skipped'], default: 'planned' },
    markedBy:      { type: String, default: null },
    addedBy:       { type: String, default: '' },
    funFact:       { type: String, default: '', trim: true },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
)

SpotSchema.index({ status: 1 })
SpotSchema.index({ day: 1, order: 1 })

const Spot: Model<ISpot> =
  mongoose.models.Spot ?? mongoose.model<ISpot>('Spot', SpotSchema)

export default Spot
