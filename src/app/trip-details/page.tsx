import { connectDB } from '@/lib/db'
import { TripDetail } from '@/lib/models'
import Navbar from '@/components/shared/Navbar'
import TripDetailsDashboard from '@/components/trip-details/TripDetailsDashboard'

async function getTripDetails() {
  await connectDB()
  const details = await TripDetail.find({}).sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(details))
}

export default async function TripDetailsPage() {
  const details = await getTripDetails()

  return (
    <div className="min-h-screen bg-[#1A1A2E] pb-24 md:pb-8">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <TripDetailsDashboard details={details} />
      </div>
    </div>
  )
}
