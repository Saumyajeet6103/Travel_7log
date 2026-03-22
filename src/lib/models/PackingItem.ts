import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPackingItem extends Document {
  label: string
  category: 'clothes' | 'toiletries' | 'docs' | 'meds' | 'tech' | 'food' | 'misc'
  checkedBy: string[]     // Array of member names who checked it
  isGlobal: boolean       // true = everyone needs it | false = personal item
  addedBy: string         // Member name or "admin"
  order: number
  createdAt: Date
  updatedAt: Date
}

const PackingItemSchema = new Schema<IPackingItem>(
  {
    label:     { type: String, required: true, trim: true },
    category:  { type: String, enum: ['clothes', 'toiletries', 'docs', 'meds', 'tech', 'food', 'misc'], default: 'misc' },
    checkedBy: { type: [String], default: [] },
    isGlobal:  { type: Boolean, default: false },
    addedBy:   { type: String, required: true },
    order:     { type: Number, default: 0 },
  },
  { timestamps: true }
)

PackingItemSchema.index({ category: 1, order: 1 })

const PackingItem: Model<IPackingItem> =
  mongoose.models.PackingItem ?? mongoose.model<IPackingItem>('PackingItem', PackingItemSchema)

export default PackingItem
