import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAnnouncement extends Document {
  title: string
  body: string
  priority: 'normal' | 'urgent' | 'info'
  createdBy: string       // admin name
  readBy: string[]        // member names who dismissed/read it
  pinned: boolean
  createdAt: Date
  updatedAt: Date
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title:     { type: String, required: true, trim: true },
    body:      { type: String, default: '', trim: true },
    priority:  { type: String, enum: ['normal', 'urgent', 'info'], default: 'normal' },
    createdBy: { type: String, required: true },
    readBy:    { type: [String], default: [] },
    pinned:    { type: Boolean, default: false },
  },
  { timestamps: true }
)

AnnouncementSchema.index({ createdAt: -1 })
AnnouncementSchema.index({ pinned: -1, createdAt: -1 })

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ?? mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema)

export default Announcement
