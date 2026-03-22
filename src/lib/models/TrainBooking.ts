import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITrainBooking extends Document {
  leg:          string   // e.g. "Vadodara → Neral"
  trainNumber:  string   // e.g. "11010"
  trainName:    string   // e.g. "Sinhagad Express"
  pnr:          string   // 10-digit PNR
  fromStation:  string   // e.g. "BRC"
  toStation:    string   // e.g. "NRL"
  journeyDate:  Date
  addedBy:      string
  createdAt:    Date
  updatedAt:    Date
}

const TrainBookingSchema = new Schema<ITrainBooking>(
  {
    leg:         { type: String, required: true, trim: true },
    trainNumber: { type: String, required: true, trim: true },
    trainName:   { type: String, default: '', trim: true },
    pnr:         { type: String, required: true, trim: true },
    fromStation: { type: String, default: '', trim: true },
    toStation:   { type: String, default: '', trim: true },
    journeyDate: { type: Date, required: true },
    addedBy:     { type: String, default: '' },
  },
  { timestamps: true }
)

const TrainBooking: Model<ITrainBooking> =
  mongoose.models.TrainBooking ?? mongoose.model<ITrainBooking>('TrainBooking', TrainBookingSchema)

export default TrainBooking
