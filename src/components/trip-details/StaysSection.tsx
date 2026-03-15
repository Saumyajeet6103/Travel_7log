'use client'

import { useState } from 'react'
import { MapPin, Phone, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'

export interface StayContent {
  hotelName: string
  address: string
  checkIn: string
  checkOut: string
  checkInTime: string
  checkOutTime: string
  confirmationNumber: string
  contactNumber: string
  costPerHead: number
  totalCost: number
  rooms: string[]
  notes: string
}

interface StayCardProps {
  title: string
  icon: string
  content: StayContent
  isAdmin: boolean
  onEdit: () => void
}

function StayCard({ title, icon, content, isAdmin, onEdit }: StayCardProps) {
  const isTBD = !content.hotelName || content.hotelName === 'TBD'
  const perPerson = content.costPerHead || (content.totalCost ? Math.ceil(content.totalCost / 7) : 0)

  return (
    <div className={`rounded-2xl border p-5 ${isTBD ? 'bg-[#0F3460]/40 border-dashed border-[#0F3460]' : 'bg-[#16213E] border-[#0F3460]'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0F3460] flex items-center justify-center text-2xl">{icon}</div>
          <div>
            <p className="font-heading font-bold text-[#E8F5E9]">{title}</p>
            <p className={`text-sm ${isTBD ? 'text-[#A0AEC0] italic' : 'text-[#52B788]'}`}>
              {isTBD ? 'Booking TBD 🙏' : content.hotelName}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-[#0F3460] text-[#A0AEC0] hover:text-[#52B788] transition-colors">
            <Pencil size={14} />
          </button>
        )}
      </div>

      {!isTBD ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#0F3460]/60 rounded-xl p-3">
              <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wide mb-0.5">Check-in</p>
              <p className="text-sm font-medium text-[#E8F5E9]">{content.checkIn}</p>
              {content.checkInTime && <p className="text-[10px] text-[#A0AEC0]">{content.checkInTime}</p>}
            </div>
            <div className="bg-[#0F3460]/60 rounded-xl p-3">
              <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wide mb-0.5">Check-out</p>
              <p className="text-sm font-medium text-[#E8F5E9]">{content.checkOut}</p>
              {content.checkOutTime && <p className="text-[10px] text-[#A0AEC0]">{content.checkOutTime}</p>}
            </div>
          </div>

          {(perPerson > 0 || content.totalCost > 0) && (
            <div className="flex items-center justify-between py-3 border-t border-[#0F3460] mb-4">
              <div>
                <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wide">Total</p>
                <p className="text-base font-bold text-[#F4A261]">₹{content.totalCost.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wide">Per person</p>
                <p className="text-base font-bold text-[#52B788]">₹{perPerson.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {content.address && (
              <div className="flex items-center gap-2 text-xs text-[#A0AEC0]">
                <MapPin size={12} className="flex-shrink-0" />
                <span>{content.address}</span>
              </div>
            )}
            {content.contactNumber && (
              <div className="flex items-center gap-2 text-xs text-[#A0AEC0]">
                <Phone size={12} className="flex-shrink-0" />
                <span>{content.contactNumber}</span>
              </div>
            )}
            {content.confirmationNumber && (
              <div className="bg-[#0F3460]/40 rounded-lg px-3 py-2">
                <p className="text-[10px] text-[#A0AEC0]">Confirmation</p>
                <p className="text-xs font-medium text-[#E8F5E9]">{content.confirmationNumber}</p>
              </div>
            )}
          </div>

          {content.rooms?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {content.rooms.map((r, i) => (
                <span key={i} className="text-[10px] bg-[#0F3460] text-[#A0AEC0] px-2 py-0.5 rounded-full">{r}</span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-[#A0AEC0] italic">Booking not yet confirmed. Admin will update once done. 🏨</p>
      )}

      {content.notes && (
        <p className="mt-3 text-xs text-[#A0AEC0] italic bg-[#0F3460]/30 rounded-lg px-3 py-2">
          💡 {content.notes}
        </p>
      )}
    </div>
  )
}

interface EditStayModalProps {
  title: string
  content: StayContent
  onSave: (c: StayContent) => void
  onClose: () => void
}

function EditStayModal({ title, content, onSave, onClose }: EditStayModalProps) {
  const [form, setForm] = useState({ ...content })
  const f = (key: keyof StayContent, label: string, ph = '', type = 'text') => (
    <div>
      <label className="block text-xs text-[#A0AEC0] mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string | number}
        onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
        placeholder={ph}
        className="w-full px-3 py-2 bg-[#1A1A2E] border border-[#0F3460] rounded-lg text-[#E8F5E9] placeholder-[#A0AEC0]/40 text-sm focus:outline-none focus:border-[#52B788]"
      />
    </div>
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#16213E] border border-[#0F3460] rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#16213E] border-b border-[#0F3460] px-5 py-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-base text-[#E8F5E9]">🏨 Edit: {title}</h2>
          <button onClick={onClose} className="text-[#A0AEC0] hover:text-[#E8F5E9] text-xl">×</button>
        </div>
        <div className="p-5 space-y-3">
          {f('hotelName', 'Hotel Name', 'e.g. Brightland Resort')}
          {f('address', 'Address', 'Near Charlotte Lake, Matheran')}
          {f('checkIn', 'Check-in Date', 'e.g. 2026-03-26')}
          {f('checkInTime', 'Check-in Time', 'e.g. 4:00 PM')}
          {f('checkOut', 'Check-out Date', 'e.g. 2026-03-28')}
          {f('checkOutTime', 'Check-out Time', 'e.g. 11:00 AM')}
          {f('totalCost', 'Total Cost (₹)', '0', 'number')}
          {f('costPerHead', 'Cost per Person (₹)', '0', 'number')}
          {f('confirmationNumber', 'Confirmation #', 'e.g. BK123456')}
          {f('contactNumber', 'Contact Number', 'e.g. +91 98765 43210')}
          {f('notes', 'Notes', 'Any tips or info')}
          <button
            onClick={() => { onSave(form); onClose(); toast.success('🏨 Stay updated!') }}
            className="w-full py-2.5 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-heading font-bold rounded-xl text-sm transition-all"
          >
            Save ✅
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  matheranTitle: string
  matheranIcon: string
  matheranContent: StayContent
  mumbaiTitle: string
  mumbaiIcon: string
  mumbaiContent: StayContent
  isAdmin: boolean
  onUpdateMatheran: (c: StayContent) => void
  onUpdateMumbai: (c: StayContent) => void
}

export default function StaysSection({
  matheranTitle, matheranIcon, matheranContent,
  mumbaiTitle, mumbaiIcon, mumbaiContent,
  isAdmin, onUpdateMatheran, onUpdateMumbai,
}: Props) {
  const [editing, setEditing] = useState<'matheran' | 'mumbai' | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🏨</span>
        <h3 className="font-heading font-bold text-[#E8F5E9]">Where We&apos;re Crashing</h3>
        <span className="text-xs text-[#A0AEC0] bg-[#0F3460] px-2 py-0.5 rounded-full">7 guys + 1 room = chaos 💀</span>
      </div>

      <StayCard
        title={matheranTitle}
        icon={matheranIcon}
        content={matheranContent}
        isAdmin={isAdmin}
        onEdit={() => setEditing('matheran')}
      />
      <StayCard
        title={mumbaiTitle}
        icon={mumbaiIcon}
        content={mumbaiContent}
        isAdmin={isAdmin}
        onEdit={() => setEditing('mumbai')}
      />

      {editing === 'matheran' && (
        <EditStayModal
          title={matheranTitle}
          content={matheranContent}
          onSave={onUpdateMatheran}
          onClose={() => setEditing(null)}
        />
      )}
      {editing === 'mumbai' && (
        <EditStayModal
          title={mumbaiTitle}
          content={mumbaiContent}
          onSave={onUpdateMumbai}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
