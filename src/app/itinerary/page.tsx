import { connectDB } from '@/lib/db'
import { Spot } from '@/lib/models'
import Navbar from '@/components/shared/Navbar'
import ItineraryDashboard from '@/components/itinerary/ItineraryDashboard'

async function getSpots() {
  await connectDB()
  const spots = await Spot.find({}).sort({ day: 1, order: 1 }).lean()
  return JSON.parse(JSON.stringify(spots))
}

export default async function ItineraryPage() {
  const spots = await getSpots()

  return (
    <div className="min-h-screen bg-[#1A1A2E] pb-24 md:pb-6">
      <Navbar />
      <ItineraryDashboard initialSpots={spots} />
    </div>
  )
}
