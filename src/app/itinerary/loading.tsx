import Navbar from '@/components/shared/Navbar'
import PageLoader from '@/components/shared/PageLoader'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1A1A2E] pb-24 md:pb-0">
      <Navbar />
      <PageLoader />
    </div>
  )
}
