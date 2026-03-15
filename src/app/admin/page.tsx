import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Member, User } from '@/lib/models'
import Navbar from '@/components/shared/Navbar'
import AdminDashboard from '@/components/admin/AdminDashboard'

async function getData() {
  await connectDB()
  const [members, users] = await Promise.all([
    Member.find({}).sort({ name: 1 }).lean(),
    User.find({}).select('-passwordHash').sort({ role: -1, username: 1 }).lean(),
  ])
  return { members, users }
}

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const { members, users } = await getData()

  return (
    <div className="min-h-screen bg-[#1A1A2E] pb-24 md:pb-8">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <AdminDashboard
          members={JSON.parse(JSON.stringify(members))}
          users={JSON.parse(JSON.stringify(users))}
        />
      </div>
    </div>
  )
}
