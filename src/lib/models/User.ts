import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  role: 'admin' | 'member'
  username: string
  passwordHash: string
  email: string | null
  memberId: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    role:         { type: String, enum: ['admin', 'member'], required: true },
    username:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    email:        { type: String, default: null, lowercase: true, trim: true },
    memberId:     { type: Schema.Types.ObjectId, ref: 'Member', default: null },
  },
  { timestamps: true }
)

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)

export default User
