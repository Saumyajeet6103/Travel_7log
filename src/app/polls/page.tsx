import Navbar from '@/components/shared/Navbar'
import PollsDashboard from '@/components/polls/PollsDashboard'

export default function PollsPage() {
  return (
    <div className="min-h-screen bg-base pb-24 md:pb-6">
      <Navbar />
      <PollsDashboard />
    </div>
  )
}
