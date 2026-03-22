'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { LogOut, Mountain, Receipt, Map, Navigation, Shield, Menu, X, Calculator as CalcIcon, Sun, Moon, BarChart3, Download, UserCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Calculator from './Calculator'
import PWAInstallGuide from './PWAInstallGuide'
import ProfileModal from './ProfileModal'

const NAV_LINKS = [
  { href: '/',             label: 'Home',        icon: Mountain  },
  { href: '/expenses',     label: 'Expenses',    icon: Receipt   },
  { href: '/itinerary',    label: 'Itinerary',   icon: Map       },
  { href: '/trip-details', label: 'Trip Details',icon: Navigation},
  { href: '/polls',        label: 'Polls',       icon: BarChart3 },
]

export default function Navbar() {
  const pathname        = usePathname()
  const { user, isAdmin, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [showCalc,    setShowCalc]    = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  if (pathname === '/login') return null

  const handleLogout = async () => {
    toast('Chal, bye bye! 👋', { icon: '🚪' })
    await logout()
  }

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3 bg-surface/90 backdrop-blur-md border-b border-subtle shadow-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🏔️</span>
          <span className="font-heading font-bold text-xl text-primary group-hover:text-warning transition-colors">
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
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
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
                  ? 'bg-warning/20 text-warning'
                  : 'text-warning/60 hover:text-warning hover:bg-warning/10'
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
                <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full border border-warning/30">
                  Admin 🛡️
                </span>
              )}
              <span className="text-sm text-muted">
                Hey <span className="text-foreground font-medium">{user.name}</span> 👋
              </span>
            </div>
          )}
          <button
            onClick={() => setShowCalc(true)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
            title="Calculator (÷7)"
          >
            <CalcIcon size={14} />
          </button>
          <button
            onClick={() => setShowInstall(true)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-info transition-colors px-3 py-1.5 rounded-lg hover:bg-info/10"
            title="Install App"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
            title="My Profile"
          >
            <UserCircle size={14} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-surface border border-subtle text-muted hover:text-foreground transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-danger/10"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>

      {/* ── Mobile Top Bar ── */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-subtle">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🏔️</span>
          <span className="font-heading font-bold text-lg text-primary">7 Log</span>
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">🛡️</span>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-surface border border-subtle text-muted hover:text-foreground transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 text-muted hover:text-foreground rounded-xl transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-surface border-b border-subtle shadow-xl animate-slide-down">
          <div className="px-4 py-3 border-b border-subtle">
            <p className="text-sm text-muted">
              Hey <span className="text-foreground font-medium">{user?.name}</span> 👋
            </p>
          </div>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-subtle/50 transition-colors ${
                  active ? 'text-primary bg-primary/10' : 'text-muted'
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
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-warning border-b border-subtle/50"
            >
              <Shield size={16} /> Admin Panel
            </Link>
          )}
          <button
            onClick={() => { setMenuOpen(false); setShowProfile(true) }}
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted w-full border-b border-subtle/50"
          >
            <UserCircle size={16} /> My Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-danger w-full"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 bg-surface/95 backdrop-blur-md border-t border-subtle shadow-[0_-2px_10px_rgb(0_0_0/0.05)]">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active ? 'text-primary' : 'text-muted'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setShowCalc(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted transition-all"
        >
          <CalcIcon size={18} />
          <span className="text-[10px] font-medium">Calc</span>
        </button>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-14" />

      {/* Calculator modal */}
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}

      {/* PWA Install Guide modal */}
      {showInstall && <PWAInstallGuide onClose={() => setShowInstall(false)} />}

      {/* Profile modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
