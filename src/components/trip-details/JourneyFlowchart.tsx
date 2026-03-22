'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Train, Clock, Hash, MapPin, FileText, Pencil } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

interface TrainLeg {
  id: string
  label: string
  from: string
  to: string
  date: string
  departureTime: string
  arrivalTime: string
  trainName: string
  trainNumber: string
  pnr: string
  platform: string
  notes: string
}

interface TrainsContent {
  legs: TrainLeg[]
}

interface Props {
  content: TrainsContent
  onUpdate: (content: TrainsContent) => void
}

const NODES = [
  { id: 'vadodara', label: 'Vadodara',  emoji: '🏠', sub: 'Home sweet home',    date: 'Mar 25' },
  { id: 'mumbai1',  label: 'Mumbai',    emoji: '🌆', sub: 'Arrive + Transit',   date: 'Mar 26 Morning' },
  { id: 'neral',    label: 'Neral',     emoji: '🏘️', sub: 'Gateway to Matheran',date: 'Mar 26' },
  { id: 'matheran', label: 'Matheran',  emoji: '🏔️', sub: '3 days of madness',  date: 'Mar 26–28', highlight: true },
  { id: 'mumbai2',  label: 'Mumbai',    emoji: '🌆', sub: 'Explore + Night stay',date: 'Mar 28–29' },
  { id: 'vadodara2',label: 'Vadodara',  emoji: '🏠', sub: 'Back to reality 😢', date: 'Mar 30 Morning' },
]


function isLegTBD(leg?: TrainLeg) {
  return !leg || leg.trainName === 'TBD' || !leg.trainName
}

interface EditLegModalProps {
  leg: TrainLeg
  onSave: (leg: TrainLeg) => void
  onClose: () => void
}

function EditLegModal({ leg, onSave, onClose }: EditLegModalProps) {
  const [form, setForm] = useState({ ...leg })
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)
    onSave(form)
    setLoading(false)
    onClose()
    toast.success('🚂 Train details updated!')
  }

  const field = (key: keyof TrainLeg, label: string, placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <input
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-subtle rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-subtle px-5 py-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-base text-foreground">✏️ Edit: {leg.label}</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3">
          {field('trainName',     'Train Name',       'e.g. August Kranti Express')}
          {field('trainNumber',   'Train Number',     'e.g. 12953')}
          {field('departureTime', 'Departure Time',   'e.g. 23:15')}
          {field('arrivalTime',   'Arrival Time',     'e.g. 07:30')}
          {field('pnr',           'PNR Number',       'e.g. 1234567890')}
          {field('platform',      'Platform',         'e.g. Platform 4')}
          {field('notes',         'Notes / Tips',     'e.g. Reach 30 min early')}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-primary-fg font-heading font-bold rounded-xl text-sm transition-all"
          >
            Save Details ✅
          </button>
        </div>
      </div>
    </div>
  )
}

function LegCard({ leg, isAdmin, onEdit }: { leg: TrainLeg; isAdmin: boolean; onEdit: () => void }) {
  const [open, setOpen] = useState(false)
  const isTBD = isLegTBD(leg)

  return (
    <div className="relative z-10 mx-auto w-full max-w-sm">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full border rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 transition-all text-left ${
          isTBD
            ? 'bg-subtle/60 border-subtle border-dashed text-muted'
            : 'bg-surface border-info/40 hover:border-info/70'
        }`}
      >
        <div className="flex items-center gap-2">
          <Train size={14} className={isTBD ? 'text-muted' : 'text-info'} />
          <div>
            <p className={`text-xs font-medium ${isTBD ? 'text-muted' : 'text-foreground'}`}>
              {leg.label}
            </p>
            <p className="text-[10px] text-muted">
              {isTBD ? 'Details TBD' : `${leg.trainName} · ${leg.departureTime}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="p-1 rounded-lg hover:bg-subtle text-muted hover:text-primary cursor-pointer"
            >
              <Pencil size={11} />
            </span>
          )}
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {open && (
        <div className="mt-1 bg-surface border border-subtle rounded-xl p-4 space-y-2 animate-fade-in">
          {[
            { icon: Train,    label: 'Train',     value: leg.trainName || '—'     },
            { icon: Hash,     label: 'Number',    value: leg.trainNumber || '—'   },
            { icon: Clock,    label: 'Departs',   value: leg.departureTime || '—' },
            { icon: Clock,    label: 'Arrives',   value: leg.arrivalTime || '—'   },
            { icon: MapPin,   label: 'Platform',  value: leg.platform || '—'      },
            { icon: FileText, label: 'PNR',       value: leg.pnr || '—'           },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={12} className="text-muted flex-shrink-0" />
              <span className="text-xs text-muted w-16 flex-shrink-0">{label}</span>
              <span className={`text-xs font-medium ${value === '—' ? 'text-muted/50' : 'text-foreground'}`}>
                {value}
              </span>
            </div>
          ))}
          {leg.notes && (
            <p className="text-xs text-muted italic bg-subtle/40 rounded-lg px-3 py-2 mt-2">
              💡 {leg.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function JourneyFlowchart({ content, onUpdate }: Props) {
  const { isAdmin } = useAuth()
  const [editingLeg, setEditingLeg] = useState<TrainLeg | null>(null)

  const getLeg = (legId: string) => content.legs.find((l) => l.id === legId)

  const handleSaveLeg = (updated: TrainLeg) => {
    const newLegs = content.legs.map((l) => (l.id === updated.id ? updated : l))
    onUpdate({ ...content, legs: newLegs })
  }

  // Node pairs with their connecting leg
  const steps: { fromIdx: number; toIdx: number; legId: string; returnLeg?: boolean }[] = [
    { fromIdx: 0, toIdx: 1, legId: 'vad_mum' },
    { fromIdx: 1, toIdx: 2, legId: 'mum_ner' },
    { fromIdx: 2, toIdx: 3, legId: 'ner_mat' },
    { fromIdx: 3, toIdx: 4, legId: 'mum_vad', returnLeg: true },
    { fromIdx: 4, toIdx: 5, legId: 'mum_vad' },
  ]

  return (
    <div className="relative">
      {NODES.map((node, i) => {
        const step = steps.find((s) => s.fromIdx === i)
        const leg  = step ? getLeg(step.legId) : undefined

        return (
          <div key={node.id}>
            {/* ── Node ── */}
            <div className={`flex items-center gap-4 relative ${i > 0 ? 'mt-0' : ''}`}>
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center flex-shrink-0 w-8">
                {i > 0 && <div className="w-0.5 h-4 bg-subtle" />}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 flex-shrink-0 ${
                    node.highlight
                      ? 'bg-primary/20 border-primary shadow-[0_0_12px_rgba(82,183,136,0.3)]'
                      : 'bg-surface border-subtle'
                  }`}
                >
                  {node.emoji}
                </div>
              </div>

              {/* Node info */}
              <div className={`flex-1 py-3 ${i < NODES.length - 1 ? '' : ''}`}>
                <div className="flex items-center gap-2">
                  <p className={`font-heading font-bold text-base ${node.highlight ? 'text-primary' : 'text-foreground'}`}>
                    {node.label}
                  </p>
                  <span className="text-xs text-muted bg-subtle px-2 py-0.5 rounded-full">{node.date}</span>
                </div>
                <p className="text-xs text-muted">{node.sub}</p>
              </div>
            </div>

            {/* ── Connector + leg card ── */}
            {step && leg && (
              <div className="flex gap-4">
                {/* Vertical line */}
                <div className="flex flex-col items-center flex-shrink-0 w-8">
                  <div className="w-0.5 flex-1 bg-subtle" style={{ minHeight: '8px' }} />
                </div>
                {/* Leg card */}
                <div className="flex-1 py-2">
                  {step.returnLeg ? (
                    <div className="text-xs text-muted italic px-2 py-1.5 bg-subtle/30 rounded-lg border border-dashed border-subtle">
                      🔄 Return — Matheran → Neral → Mumbai (Mar 28 evening)
                    </div>
                  ) : (
                    <LegCard
                      leg={leg}
                      isAdmin={isAdmin}
                      onEdit={() => setEditingLeg(leg)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {editingLeg && (
        <EditLegModal
          leg={editingLeg}
          onSave={handleSaveLeg}
          onClose={() => setEditingLeg(null)}
        />
      )}
    </div>
  )
}
