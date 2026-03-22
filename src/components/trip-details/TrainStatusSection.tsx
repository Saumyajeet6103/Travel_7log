'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Train, RefreshCw, Plus, Trash2, ChevronUp, MapPin, Clock, AlertCircle, CheckCircle2, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'

interface TrainBooking {
  _id:          string
  leg:          string
  trainNumber:  string
  trainName:    string
  pnr:          string
  fromStation:  string
  toStation:    string
  journeyDate:  string
}

interface PassengerStatus {
  PassengerSerialNumber: number
  BookingStatus:         string
  CurrentStatus:         string
  CoachPosition?:        string
}

interface PNRData {
  PnrNumber:     string
  TrainNo:       string
  TrainName:     string
  Doj:           string
  SourceDn:      string
  DestinationDn: string
  BoardingPoint:  string
  ReservationUpto: string
  PassengerList: PassengerStatus[]
  ChartPrepared: boolean
}

interface LiveStation {
  stationCode: string
  stationName: string
  arrivalTime: string
  departureTime: string
  distance: number
  haltTime: string
  dayCount: number
  isCurrent?: boolean
  hasDeparted?: boolean
}

interface LiveTrainData {
  trainNumber:          string
  trainName:            string
  currentStationCode:   string
  currentStationName:   string
  delay:                number
  status:               string
  stationList:          LiveStation[]
}

// Status badge helper
function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase()
  const isConfirmed = s?.startsWith('CNF') || s?.startsWith('CAN') === false && s?.includes('CNF')
  const isWL = s?.startsWith('WL') || s?.startsWith('RLWL') || s?.startsWith('GNWL')
  const isRAC = s?.startsWith('RAC')

  if (isConfirmed) return (
    <span className="flex items-center gap-1 text-xs bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-medium">
      <CheckCircle2 size={10} /> {status}
    </span>
  )
  if (isWL) return (
    <span className="text-xs bg-danger/15 text-danger border border-danger/30 px-2 py-0.5 rounded-full font-medium">{status}</span>
  )
  if (isRAC) return (
    <span className="text-xs bg-warning/15 text-warning border border-warning/30 px-2 py-0.5 rounded-full font-medium">{status}</span>
  )
  return <span className="text-xs bg-subtle text-muted px-2 py-0.5 rounded-full">{status}</span>
}

function formatDelay(mins: number) {
  if (mins === 0) return { label: 'On time', color: 'text-primary' }
  if (mins > 0)   return { label: `${mins} min late`, color: 'text-danger' }
  return { label: `${Math.abs(mins)} min early`, color: 'text-primary' }
}

export default function TrainStatusSection() {
  const { isAdmin } = useAuth()
  const [bookings,    setBookings]    = useState<TrainBooking[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showAdd,     setShowAdd]     = useState(false)

  // Per-booking state: pnr status, live status, loading flags, expanded
  const [pnrData,     setPnrData]     = useState<Record<string, PNRData | null>>({})
  const [liveData,    setLiveData]    = useState<Record<string, LiveTrainData | null>>({})
  const [pnrLoading,  setPnrLoading]  = useState<Record<string, boolean>>({})
  const [liveLoading, setLiveLoading] = useState<Record<string, boolean>>({})
  const [expanded,    setExpanded]    = useState<Record<string, 'pnr' | 'live' | null>>({})

  // Add form state
  const [form, setForm] = useState({
    leg: '', trainNumber: '', trainName: '', pnr: '',
    fromStation: '', toStation: '', journeyDate: '',
  })
  const [adding, setAdding] = useState(false)

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/train-bookings')
      if (res.ok) { const d = await res.json(); setBookings(d.bookings) }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const checkPNR = async (booking: TrainBooking) => {
    setPnrLoading((p) => ({ ...p, [booking._id]: true }))
    setPnrData((p) => ({ ...p, [booking._id]: null }))
    setExpanded((p) => ({ ...p, [booking._id]: 'pnr' }))
    try {
      const res = await fetch(`/api/pnr-status?pnr=${booking.pnr}`)
      const d   = await res.json()
      if (!res.ok) { toast.error(d.error ?? 'PNR check failed'); return }
      setPnrData((p) => ({ ...p, [booking._id]: d.data }))
    } catch {
      toast.error('Network error checking PNR')
    } finally {
      setPnrLoading((p) => ({ ...p, [booking._id]: false }))
    }
  }

  const checkLive = async (booking: TrainBooking) => {
    setLiveLoading((p) => ({ ...p, [booking._id]: true }))
    setLiveData((p) => ({ ...p, [booking._id]: null }))
    setExpanded((p) => ({ ...p, [booking._id]: 'live' }))
    try {
      const today     = new Date(); today.setHours(0,0,0,0)
      const journey   = new Date(booking.journeyDate); journey.setHours(0,0,0,0)
      const diffDays  = Math.round((today.getTime() - journey.getTime()) / 86400000)
      const startDay  = Math.max(0, Math.min(2, diffDays))

      const res = await fetch(`/api/live-train?train=${booking.trainNumber}&day=${startDay}`)
      const d   = await res.json()
      if (!res.ok) { toast.error(d.error ?? 'Live status failed'); return }
      setLiveData((p) => ({ ...p, [booking._id]: d.data }))
    } catch {
      toast.error('Network error checking live status')
    } finally {
      setLiveLoading((p) => ({ ...p, [booking._id]: false }))
    }
  }

  const addBooking = async () => {
    if (!form.leg.trim() || !form.trainNumber.trim() || !form.pnr.trim() || !form.journeyDate) {
      toast.error('Fill all required fields'); return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/train-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error ?? 'Failed'); return }
      setBookings((prev) => [...prev, d.booking])
      setForm({ leg: '', trainNumber: '', trainName: '', pnr: '', fromStation: '', toStation: '', journeyDate: '' })
      setShowAdd(false)
      toast.success('Train booking added!')
    } finally {
      setAdding(false)
    }
  }

  const deleteBooking = async (id: string) => {
    if (!confirm('Remove this booking?')) return
    const res = await fetch(`/api/train-bookings/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b._id !== id))
      toast.success('Booking removed')
    }
  }

  const toggleExpand = (id: string, view: 'pnr' | 'live') => {
    setExpanded((p) => ({ ...p, [id]: p[id] === view ? null : view }))
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Train size={18} className="text-primary" />
          <h3 className="font-heading font-bold text-foreground">Train Bookings</h3>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-xs hover:bg-primary/20 transition-all"
          >
            <Plus size={12} /> Add Train
          </button>
        )}
      </div>

      {/* Add form (admin only) */}
      {showAdd && isAdmin && (
        <div className="bg-surface border border-subtle rounded-xl p-4 space-y-3 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Add Train Booking</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Leg * (e.g. Vadodara → Neral)"
              value={form.leg}
              onChange={(e) => setForm((f) => ({ ...f, leg: e.target.value }))}
              className="col-span-2 px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-primary text-sm"
            />
            <input
              placeholder="Train No * (e.g. 11010)"
              value={form.trainNumber}
              onChange={(e) => setForm((f) => ({ ...f, trainNumber: e.target.value }))}
              className="px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-primary text-sm"
            />
            <input
              placeholder="Train Name (e.g. Sinhagad Exp)"
              value={form.trainName}
              onChange={(e) => setForm((f) => ({ ...f, trainName: e.target.value }))}
              className="px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-primary text-sm"
            />
            <input
              placeholder="PNR * (10 digits)"
              value={form.pnr}
              onChange={(e) => setForm((f) => ({ ...f, pnr: e.target.value }))}
              maxLength={10}
              className="px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-primary text-sm font-mono"
            />
            <input
              placeholder="Journey Date *"
              type="date"
              value={form.journeyDate}
              onChange={(e) => setForm((f) => ({ ...f, journeyDate: e.target.value }))}
              className="px-3 py-2 bg-base border border-subtle rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
            />
            <input
              placeholder="From Station (e.g. BRC)"
              value={form.fromStation}
              onChange={(e) => setForm((f) => ({ ...f, fromStation: e.target.value }))}
              className="px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-primary text-sm"
            />
            <input
              placeholder="To Station (e.g. NRL)"
              value={form.toStation}
              onChange={(e) => setForm((f) => ({ ...f, toStation: e.target.value }))}
              className="px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg text-muted bg-subtle/40 text-sm hover:bg-subtle transition-all">Cancel</button>
            <button
              onClick={addBooking}
              disabled={adding}
              className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-dark text-primary-fg font-bold text-sm transition-all disabled:opacity-50"
            >
              {adding ? 'Saving...' : 'Save Booking'}
            </button>
          </div>
        </div>
      )}

      {/* No bookings */}
      {bookings.length === 0 && !showAdd && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🚆</p>
          <p className="font-heading font-bold text-primary">No train bookings yet</p>
          <p className="text-xs text-muted mt-1">
            {isAdmin ? 'Add your PNR numbers using the button above.' : 'Admin will add PNR details soon.'}
          </p>
        </div>
      )}

      {/* Booking cards */}
      {bookings.map((booking) => {
        const pnr      = pnrData[booking._id]
        const live     = liveData[booking._id]
        const view     = expanded[booking._id]
        const delay    = live ? formatDelay(live.delay ?? 0) : null

        return (
          <div key={booking._id} className="bg-surface border border-subtle rounded-xl overflow-hidden">
            {/* Card header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🚆</span>
                    <p className="font-heading font-bold text-sm text-foreground truncate">{booking.leg}</p>
                  </div>
                  <p className="text-xs text-primary font-medium">{booking.trainNumber} {booking.trainName && `· ${booking.trainName}`}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {booking.fromStation && booking.toStation && (
                      <span className="text-xs text-muted">
                        <span className="font-mono">{booking.fromStation}</span>
                        {' → '}
                        <span className="font-mono">{booking.toStation}</span>
                      </span>
                    )}
                    <span className="text-xs text-muted">
                      {new Date(booking.journeyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted/60 font-mono mt-1">PNR: {booking.pnr}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => deleteBooking(booking._id)}
                    className="p-2 text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors flex-shrink-0"
                    aria-label={`Delete booking ${booking.leg}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => view === 'pnr' ? toggleExpand(booking._id, 'pnr') : checkPNR(booking)}
                  disabled={pnrLoading[booking._id]}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    view === 'pnr'
                      ? 'bg-primary text-primary-fg'
                      : 'bg-subtle/50 text-muted hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  {pnrLoading[booking._id]
                    ? <RefreshCw size={12} className="animate-spin" />
                    : view === 'pnr' ? <ChevronUp size={12} /> : <CheckCircle2 size={12} />
                  }
                  PNR Status
                </button>
                <button
                  onClick={() => view === 'live' ? toggleExpand(booking._id, 'live') : checkLive(booking)}
                  disabled={liveLoading[booking._id]}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    view === 'live'
                      ? 'bg-info text-white'
                      : 'bg-subtle/50 text-muted hover:text-info hover:bg-info/10'
                  }`}
                >
                  {liveLoading[booking._id]
                    ? <RefreshCw size={12} className="animate-spin" />
                    : view === 'live' ? <ChevronUp size={12} /> : <Wifi size={12} />
                  }
                  Live Status
                </button>
                {(pnrData[booking._id] || liveData[booking._id]) && view && (
                  <button
                    onClick={() => {
                      if (view === 'pnr') checkPNR(booking)
                      else checkLive(booking)
                    }}
                    className="px-3 py-2.5 bg-subtle/50 text-muted hover:text-foreground rounded-xl text-xs transition-all"
                    aria-label="Refresh status"
                  >
                    <RefreshCw size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* PNR Status panel */}
            {view === 'pnr' && (
              <div className="border-t border-subtle p-4 bg-subtle/10 animate-fade-in">
                {pnrLoading[booking._id] && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <RefreshCw size={12} className="animate-spin" /> Fetching PNR status...
                  </div>
                )}
                {!pnrLoading[booking._id] && !pnr && (
                  <div className="flex items-center gap-2 text-xs text-danger">
                    <AlertCircle size={12} /> Could not fetch PNR. Check your RapidAPI key.
                  </div>
                )}
                {pnr && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-heading font-bold text-foreground">{pnr.TrainName}</p>
                        <p className="text-xs text-muted">{pnr.SourceDn} → {pnr.DestinationDn}</p>
                        <p className="text-xs text-muted">Boarding: {pnr.BoardingPoint} · Upto: {pnr.ReservationUpto}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted">{pnr.Doj}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pnr.ChartPrepared ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}`}>
                          {pnr.ChartPrepared ? 'Chart Prepared' : 'Chart Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted uppercase tracking-wide font-medium">Passenger Status</p>
                      {pnr.PassengerList?.map((p) => (
                        <div key={p.PassengerSerialNumber} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2">
                          <span className="text-xs text-muted">Passenger {p.PassengerSerialNumber}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted">Booked: <span className="text-foreground font-mono">{p.BookingStatus}</span></span>
                            <StatusBadge status={p.CurrentStatus} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live Train Status panel */}
            {view === 'live' && (
              <div className="border-t border-subtle p-4 bg-subtle/10 animate-fade-in">
                {liveLoading[booking._id] && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <RefreshCw size={12} className="animate-spin" /> Fetching live train status...
                  </div>
                )}
                {!liveLoading[booking._id] && !live && (
                  <div className="flex items-center gap-2 text-xs text-danger">
                    <AlertCircle size={12} /> Could not fetch live status. Train may not have started yet.
                  </div>
                )}
                {live && (
                  <div className="space-y-3">
                    {/* Current position */}
                    <div className="bg-info/10 border border-info/30 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-info" />
                          <div>
                            <p className="text-sm font-heading font-bold text-foreground">
                              {live.currentStationName ?? live.currentStationCode}
                            </p>
                            <p className="text-xs text-muted">{live.status}</p>
                          </div>
                        </div>
                        {delay && (
                          <div className="text-right">
                            <Clock size={12} className={`${delay.color} ml-auto mb-0.5`} />
                            <p className={`text-xs font-medium ${delay.color}`}>{delay.label}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Station list */}
                    {live.stationList && live.stationList.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted uppercase tracking-wide font-medium mb-2">Upcoming Stations</p>
                        <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
                          {live.stationList
                            .filter((s) => !s.hasDeparted || s.isCurrent)
                            .slice(0, 10)
                            .map((s, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                                  s.isCurrent
                                    ? 'bg-info/20 border border-info/40'
                                    : 'bg-surface'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.isCurrent ? 'bg-info' : 'bg-subtle'}`} />
                                <span className={`flex-1 font-medium ${s.isCurrent ? 'text-info' : 'text-foreground'}`}>
                                  {s.stationName}
                                  {s.isCurrent && <span className="ml-1 text-info text-[9px]">← HERE</span>}
                                </span>
                                <span className="text-muted font-mono">{s.arrivalTime}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* API notice */}
      {!process.env.NEXT_PUBLIC_RAILWAY_CONFIGURED && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-warning/80">
            Live status requires <strong>RAPIDAPI_KEY</strong> in environment variables. Get a free key at rapidapi.com → search &ldquo;IRCTC API&rdquo;.
          </p>
        </div>
      )}
    </div>
  )
}
