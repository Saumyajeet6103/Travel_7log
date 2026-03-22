'use client'

import { useState, useEffect, useCallback } from 'react'
import { Pencil, Check, X, Shield, Users, RefreshCw, Megaphone, Plus, Trash2, Pin, AlertTriangle, Info, KeyRound, UserPlus, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface MemberDoc {
  _id: string
  name: string
  nickname: string
  emoji: string
  color: string
  totalPaid: number
  totalOwed: number
}

interface UserDoc {
  _id: string
  username: string
  role: string
  email?: string
}

interface Props {
  members: MemberDoc[]
  users: UserDoc[]
}

const EMOJI_OPTIONS = ['🧑', '👦', '🧔', '🧑‍💻', '🤠', '😎', '🤓', '🧑‍🎤', '🤡', '🥷', '🦸', '🧑‍🍳']

function MemberCard({ member, onSave }: { member: MemberDoc; onSave: (id: string, nickname: string, emoji: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState(member.nickname || '')
  const [emoji, setEmoji] = useState(member.emoji || '🧑')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await onSave(member._id, nickname, emoji)
    setSaving(false)
    setEditing(false)
  }

  const cancel = () => {
    setNickname(member.nickname || '')
    setEmoji(member.emoji || '🧑')
    setEditing(false)
  }

  return (
    <div className="bg-surface border border-subtle rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 flex-shrink-0"
          style={{ borderColor: member.color + '60', backgroundColor: member.color + '20' }}
        >
          {editing ? emoji : member.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-foreground">{member.name}</p>
          {!editing && (
            <p className="text-xs text-muted italic">
              {member.nickname ? `"${member.nickname}"` : 'No nickname yet'}
            </p>
          )}
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg hover:bg-subtle text-muted hover:text-primary transition-colors"
          >
            <Pencil size={14} />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={save}
              disabled={saving}
              className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button
              onClick={cancel}
              className="p-2 rounded-lg hover:bg-subtle text-muted hover:text-danger transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="space-y-3 animate-fade-in">
          <div>
            <label className="block text-xs text-muted mb-1">Nickname</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder='e.g. "The Kanjoos", "GPS Master"'
              autoFocus
              className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-[#A0AEC0]/40 text-sm focus:outline-none focus:border-[#52B788]"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg transition-all ${
                    emoji === e
                      ? 'bg-primary/30 border-2 border-[#52B788] scale-110'
                      : 'bg-subtle hover:bg-subtle/80'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!editing && (
        <div className="flex gap-3 text-xs text-muted pt-1 border-t border-subtle">
          <span>Paid: <span className="text-primary font-medium">₹{member.totalPaid.toLocaleString('en-IN')}</span></span>
          <span>Owed: <span className="text-danger font-medium">₹{member.totalOwed.toLocaleString('en-IN')}</span></span>
        </div>
      )}
    </div>
  )
}

interface AnnouncementDoc {
  _id: string
  title: string
  body: string
  priority: 'normal' | 'urgent' | 'info'
  createdBy: string
  readBy: string[]
  pinned: boolean
  createdAt: string
}

export default function AdminDashboard({ members, users }: Props) {
  const [localMembers, setLocalMembers] = useState(members)
  const [localUsers, setLocalUsers] = useState(users)
  const [activeTab, setActiveTab] = useState<'members' | 'users' | 'announcements'>('members')
  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([])
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [annTitle, setAnnTitle] = useState('')
  const [annBody, setAnnBody] = useState('')
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent' | 'info'>('normal')
  const [annPinned, setAnnPinned] = useState(false)
  const [annCreating, setAnnCreating] = useState(false)

  // Reset password state
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [resetPass, setResetPass] = useState('')
  const [resetShowPass, setResetShowPass] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Add user state
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPass, setNewPass] = useState('')
  const [newRole, setNewRole] = useState<'member' | 'admin'>('member')
  const [newMemberId, setNewMemberId] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [addingUser, setAddingUser] = useState(false)

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements ?? [])
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (activeTab === 'announcements') fetchAnnouncements()
  }, [activeTab, fetchAnnouncements])

  const createAnnouncement = async () => {
    if (!annTitle.trim()) { toast.error('Title daalo 📢'); return }
    setAnnCreating(true)
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: annTitle, body: annBody, priority: annPriority, pinned: annPinned }),
      })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements((prev) => [data.announcement, ...prev])
        setAnnTitle('')
        setAnnBody('')
        setAnnPriority('normal')
        setAnnPinned(false)
        setShowAnnForm(false)
        toast.success('📢 Announcement sent!')
      }
    } finally {
      setAnnCreating(false)
    }
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAnnouncements((prev) => prev.filter((a) => a._id !== id))
      toast.success('Deleted')
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!resetPass.trim()) { toast.error('Password daalo bhai'); return }
    if (resetPass.length < 6) { toast.error('Min 6 characters'); return }
    setResetting(true)
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: resetPass }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Password reset! ${data.message} 🔐`)
        setResetUserId(null)
        setResetPass('')
        setResetShowPass(false)
      } else {
        toast.error(data.error ?? 'Failed')
      }
    } finally {
      setResetting(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUsername.trim()) { toast.error('Username required'); return }
    if (!newPass.trim()) { toast.error('Password required'); return }
    setAddingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: newPass,
          role: newRole,
          memberId: newMemberId || undefined,
          email: newEmail || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`User "${data.user.username}" created! 🎉`)
        setLocalUsers((prev) => [...prev, data.user])
        setNewUsername('')
        setNewPass('')
        setNewRole('member')
        setNewMemberId('')
        setNewEmail('')
        setShowAddUser(false)
      } else {
        toast.error(data.error ?? 'Failed')
      }
    } finally {
      setAddingUser(false)
    }
  }

  const saveMember = async (id: string, nickname: string, emoji: string) => {
    const res = await fetch(`/api/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, emoji }),
    })
    if (res.ok) {
      setLocalMembers((prev) =>
        prev.map((m) => (m._id === id ? { ...m, nickname, emoji } : m))
      )
      toast.success('✅ Member updated!')
    } else {
      toast.error('Update failed 💀')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-warning/20 border border-warning/30 flex items-center justify-center">
          <Shield size={18} className="text-warning" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted">Ye power responsibly use karna 🛡️</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs bg-warning/10 border border-warning/30 text-warning px-2 py-1 rounded-full">
            🔐 Admin Only
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([['members', '👥', 'Members'], ['users', '🔑', 'Accounts'], ['announcements', '📢', 'Announce']] as const).map(([tab, emoji, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-warning text-primary-fg font-bold'
                : 'bg-surface border border-subtle text-muted hover:text-foreground'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Set nicknames and emojis for each squad member. These show on the home page and throughout the app.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {localMembers.map((m) => (
              <MemberCard key={m._id} member={m} onSave={saveMember} />
            ))}
          </div>
        </div>
      )}

      {/* Users/accounts tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              All accounts. Click the key icon to reset a password.
            </p>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-xs hover:bg-primary/20 transition-all"
            >
              <UserPlus size={12} /> Add User
            </button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <div className="bg-surface border border-primary/30 rounded-xl p-4 space-y-3 animate-fade-in">
              <p className="text-xs font-bold text-foreground">Create New Account</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Username"
                  className="px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Password (min 6)"
                  className="px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 text-sm focus:outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'member' | 'admin')}
                  className="flex-1 px-3 py-2 bg-base border border-subtle rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-base border border-subtle rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Link to member (optional)</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddUser}
                  disabled={addingUser || !newUsername.trim() || !newPass.trim()}
                  className="flex-1 py-2 bg-primary hover:bg-primary-dark text-primary-fg font-bold rounded-lg text-sm transition-all disabled:opacity-50"
                >
                  {addingUser ? 'Creating...' : 'Create Account'}
                </button>
                <button
                  onClick={() => { setShowAddUser(false); setNewUsername(''); setNewPass(''); setNewEmail('') }}
                  className="px-4 py-2 border border-subtle rounded-lg text-muted text-sm hover:border-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {localUsers.map((u) => (
            <div key={u._id} className="bg-surface border border-subtle rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  u.role === 'admin' ? 'bg-warning/20' : 'bg-primary/10'
                }`}>
                  {u.role === 'admin' ? <Shield size={14} className="text-warning" /> : <Users size={14} className="text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{u.username}</p>
                  {u.email && <p className="text-xs text-muted">{u.email}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  u.role === 'admin'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {u.role}
                </span>
                <button
                  onClick={() => { setResetUserId(resetUserId === u._id ? null : u._id); setResetPass(''); setResetShowPass(false) }}
                  className={`p-2 rounded-lg transition-colors ${
                    resetUserId === u._id
                      ? 'bg-warning/20 text-warning'
                      : 'hover:bg-subtle text-muted hover:text-warning'
                  }`}
                  title="Reset password"
                >
                  <KeyRound size={14} />
                </button>
              </div>

              {/* Inline reset password */}
              {resetUserId === u._id && (
                <div className="flex gap-2 pt-2 border-t border-subtle animate-fade-in">
                  <div className="relative flex-1">
                    <input
                      type={resetShowPass ? 'text' : 'password'}
                      value={resetPass}
                      onChange={(e) => setResetPass(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleResetPassword(u._id)}
                      placeholder="New password (min 6)"
                      autoFocus
                      className="w-full px-3 py-2 pr-9 bg-base border border-warning/30 rounded-lg text-foreground placeholder-muted/40 text-sm focus:outline-none focus:border-warning"
                    />
                    <button
                      type="button"
                      onClick={() => setResetShowPass(!resetShowPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {resetShowPass ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleResetPassword(u._id)}
                    disabled={resetting || resetPass.length < 6}
                    className="px-3 py-2 bg-warning hover:bg-warning/80 text-primary-fg font-bold rounded-lg text-xs transition-all disabled:opacity-50"
                  >
                    {resetting ? '...' : 'Reset'}
                  </button>
                  <button
                    onClick={() => { setResetUserId(null); setResetPass('') }}
                    className="px-2 py-2 text-muted hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Announcements tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Send announcements to all members. Shows as banners on the home page.
            </p>
            <button
              onClick={() => setShowAnnForm(!showAnnForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-xs hover:bg-primary/20 transition-all"
            >
              <Plus size={12} /> New
            </button>
          </div>

          {showAnnForm && (
            <div className="bg-surface border border-subtle rounded-xl p-4 space-y-3 animate-fade-in">
              <input
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Announcement title..."
                className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
              />
              <textarea
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                placeholder="Details (optional)..."
                rows={2}
                className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm resize-none"
              />
              <div className="flex gap-2 flex-wrap">
                {(['normal', 'urgent', 'info'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnnPriority(p)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      annPriority === p
                        ? p === 'urgent'
                          ? 'bg-danger/20 border-danger/60 text-danger'
                          : p === 'info'
                            ? 'bg-info/20 border-info/60 text-info'
                            : 'bg-primary/20 border-primary/60 text-primary'
                        : 'bg-base border-subtle text-muted'
                    }`}
                  >
                    {p === 'urgent' && <AlertTriangle size={10} />}
                    {p === 'info' && <Info size={10} />}
                    {p === 'normal' && <Megaphone size={10} />}
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annPinned}
                    onChange={(e) => setAnnPinned(e.target.checked)}
                    className="accent-warning"
                  />
                  <Pin size={10} /> Pinned
                </label>
              </div>
              <button
                onClick={createAnnouncement}
                disabled={annCreating}
                className="w-full py-2 bg-primary hover:bg-primary-dark text-primary-fg font-bold rounded-lg text-sm transition-all disabled:opacity-50"
              >
                {annCreating ? 'Sending...' : 'Send Announcement 📢'}
              </button>
            </div>
          )}

          {announcements.length === 0 ? (
            <div className="text-center py-10 text-muted">
              <p className="text-3xl mb-2">📢</p>
              <p className="text-sm">No announcements yet</p>
            </div>
          ) : (
            announcements.map((a) => (
              <div key={a._id} className={`flex items-start gap-3 bg-surface border rounded-xl p-4 ${
                a.priority === 'urgent' ? 'border-danger/30' : a.priority === 'info' ? 'border-info/30' : 'border-subtle'
              }`}>
                <div className="mt-0.5">
                  {a.priority === 'urgent' ? <AlertTriangle size={14} className="text-danger" /> :
                   a.priority === 'info' ? <Info size={14} className="text-info" /> :
                   <Megaphone size={14} className="text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{a.title}</p>
                    {a.pinned && <Pin size={10} className="text-warning" />}
                  </div>
                  {a.body && <p className="text-xs text-muted mt-0.5">{a.body}</p>}
                  <p className="text-[10px] text-muted/50 mt-1">
                    {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Read by {a.readBy.length}/7
                  </p>
                </div>
                <button
                  onClick={() => deleteAnnouncement(a._id)}
                  className="p-1.5 text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
