'use client'

import { useState } from 'react'
import { Pencil, Check, X, Shield, Users, RefreshCw } from 'lucide-react'
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
    <div className="bg-[#16213E] border border-[#0F3460] rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 flex-shrink-0"
          style={{ borderColor: member.color + '60', backgroundColor: member.color + '20' }}
        >
          {editing ? emoji : member.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-[#E8F5E9]">{member.name}</p>
          {!editing && (
            <p className="text-xs text-[#A0AEC0] italic">
              {member.nickname ? `"${member.nickname}"` : 'No nickname yet'}
            </p>
          )}
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg hover:bg-[#0F3460] text-[#A0AEC0] hover:text-[#52B788] transition-colors"
          >
            <Pencil size={14} />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={save}
              disabled={saving}
              className="p-2 rounded-lg bg-[#52B788]/20 text-[#52B788] hover:bg-[#52B788]/30 transition-colors"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button
              onClick={cancel}
              className="p-2 rounded-lg hover:bg-[#0F3460] text-[#A0AEC0] hover:text-[#E63946] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="space-y-3 animate-fade-in">
          <div>
            <label className="block text-xs text-[#A0AEC0] mb-1">Nickname</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder='e.g. "The Kanjoos", "GPS Master"'
              autoFocus
              className="w-full px-3 py-2 bg-[#1A1A2E] border border-[#0F3460] rounded-lg text-[#E8F5E9] placeholder-[#A0AEC0]/40 text-sm focus:outline-none focus:border-[#52B788]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0AEC0] mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg transition-all ${
                    emoji === e
                      ? 'bg-[#52B788]/30 border-2 border-[#52B788] scale-110'
                      : 'bg-[#0F3460] hover:bg-[#0F3460]/80'
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
        <div className="flex gap-3 text-xs text-[#A0AEC0] pt-1 border-t border-[#0F3460]">
          <span>Paid: <span className="text-[#52B788] font-medium">₹{member.totalPaid.toLocaleString('en-IN')}</span></span>
          <span>Owed: <span className="text-[#E63946] font-medium">₹{member.totalOwed.toLocaleString('en-IN')}</span></span>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard({ members, users }: Props) {
  const [localMembers, setLocalMembers] = useState(members)
  const [activeTab, setActiveTab] = useState<'members' | 'users'>('members')

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
        <div className="w-10 h-10 rounded-xl bg-[#F4A261]/20 border border-[#F4A261]/30 flex items-center justify-center">
          <Shield size={18} className="text-[#F4A261]" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl text-[#E8F5E9]">Admin Panel</h1>
          <p className="text-xs text-[#A0AEC0]">Ye power responsibly use karna 🛡️</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs bg-[#F4A261]/10 border border-[#F4A261]/30 text-[#F4A261] px-2 py-1 rounded-full">
            🔐 Admin Only
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([['members', '👥', 'Members'], ['users', '🔑', 'Accounts']] as const).map(([tab, emoji, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[#F4A261] text-[#1A1A2E] font-bold'
                : 'bg-[#16213E] border border-[#0F3460] text-[#A0AEC0] hover:text-[#E8F5E9]'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <p className="text-sm text-[#A0AEC0]">
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
          <p className="text-sm text-[#A0AEC0]">
            All accounts. Members can reset password via their profile (OTP to email).
          </p>
          {users.map((u) => (
            <div key={u._id} className="flex items-center gap-3 bg-[#16213E] border border-[#0F3460] rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                u.role === 'admin' ? 'bg-[#F4A261]/20' : 'bg-[#52B788]/10'
              }`}>
                {u.role === 'admin' ? <Shield size={14} className="text-[#F4A261]" /> : <Users size={14} className="text-[#52B788]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#E8F5E9]">{u.username}</p>
                {u.email && <p className="text-xs text-[#A0AEC0]">{u.email}</p>}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                u.role === 'admin'
                  ? 'bg-[#F4A261]/20 text-[#F4A261]'
                  : 'bg-[#52B788]/10 text-[#52B788]'
              }`}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
