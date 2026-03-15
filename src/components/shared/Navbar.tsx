'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogOut, Mountain, Receipt, Map, Navigation, Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { href: '/',             label: 'Home',        icon: Mountain  },
  { href: '/expenses',     label: 'Expenses',    icon: Receipt   },
  { href: '/itinerary',    label: 'Itinerary',   icon: Map       },
  { href: '/trip-details', label: 'Trip Details',icon: Navigation},
]

export default function Navbar() {
  const pathname        = usePathname()
  const { user, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen]   = useState(false)

  if (pathname === '/login') return null

  const handleLogout = async () => {
    toast('Chal, bye bye! 👋', { icon: '🚪' })
    await logout()
  }

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3 bg-[#16213E]/90 backdrop-blur-md border-b border-[#0F3460]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🏔️</span>
          <span className="font-heading font-bold text-xl text-[#52B788] group-hover:text-[#F4A261] transition-colors">
            7 Log
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#52B788]/20 text-[#52B788]'
                    : 'text-[#A0AEC0] hover:text-[#E8F5E9] hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === '/admin'
                  ? 'bg-[#F4A261]/20 text-[#F4A261]'
                  : 'text-[#F4A261]/60 hover:text-[#F4A261] hover:bg-[#F4A261]/10'
              }`}
            >
              <Shield size={15} />
              Admin
            </Link>
          )}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="text-xs bg-[#F4A261]/20 text-[#F4A261] px-2 py-0.5 rounded-full border border-[#F4A261]/30">
                  Admin 🛡️
                </span>
              )}
              <span className="text-sm text-[#A0AEC0]">
                Hey <span className="text-[#E8F5E9] font-medium">{user.name}</span> 👋
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[#A0AEC0] hover:text-[#E63946] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#E63946]/10"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>

      {/* ── Mobile Top Bar ── */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#16213E]/90 backdrop-blur-md border-b border-[#0F3460]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🏔️</span>
          <span className="font-heading font-bold text-lg text-[#52B788]">7 Log</span>
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-xs bg-[#F4A261]/20 text-[#F4A261] px-2 py-0.5 rounded-full">🛡️</span>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-[#A0AEC0] hover:text-[#E8F5E9]"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-[#16213E] border-b border-[#0F3460] shadow-xl animate-slide-down">
          <div className="px-4 py-3 border-b border-[#0F3460]">
            <p className="text-sm text-[#A0AEC0]">
              Hey <span className="text-[#E8F5E9] font-medium">{user?.name}</span> 👋
            </p>
          </div>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-[#0F3460]/50 transition-colors ${
                  active ? 'text-[#52B788] bg-[#52B788]/10' : 'text-[#A0AEC0]'
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#F4A261] border-b border-[#0F3460]/50"
            >
              <Shield size={16} /> Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-[#E63946] w-full"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 bg-[#16213E]/95 backdrop-blur-md border-t border-[#0F3460]">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active ? 'text-[#52B788]' : 'text-[#A0AEC0]'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-14" />
    </>
  )
}
