import mongoose, { Schema, Document, Model } from 'mongoose'

export type TripDetailSection =
  | 'trains'
  | 'stay_matheran'
  | 'stay_mumbai'
  | 'routes'
  | 'rules'
  | 'packing'
  | 'mumbai_explore'

export interface ITripDetail extends Document {
  section: TripDetailSection
  title: string
  icon: string
  content: Record<string, unknown>   // Flexible JSON — different shape per section
  order: number
  updatedBy: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const TripDetailSchema = new Schema<ITripDetail>(
  {
    section:   { type: String, required: true, unique: true },
    title:     { type: String, required: true, trim: true },
    icon:      { type: String, default: '📋' },
    content:   { type: Schema.Types.Mixed, default: {} },
    order:     { type: Number, default: 0 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

TripDetailSchema.index({ order: 1 })

const TripDetail: Model<ITripDetail> =
  mongoose.models.TripDetail ?? mongoose.model<ITripDetail>('TripDetail', TripDetailSchema)

export default TripDetail
