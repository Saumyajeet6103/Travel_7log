'use client'

import { useState } from 'react'
import { SpotStatus } from '@/lib/models/Spot'
import { ChevronDown, ChevronUp, Pencil, Trash2, Clock } from 'lucide-react'
import { SPOT_TYPES } from '@/lib/utils'

interface SpotDoc {
  _id: string
  name: string
  description: string
  type: string
  day: string
  scheduledTime: string
  status: SpotStatus
  markedBy: string | null
  funFact: string
  order: number
  addedBy?: string
}

interface Props {
  spot:        SpotDoc
  isAdmin:     boolean
  currentUser: string
  onStatus:    (id: string, status: SpotStatus) => void
  onEdit:      (spot: SpotDoc) => void
  onDelete:    (id: string) => void
}

const STATUS_CONFIG: Record<SpotStatus, { label: string; color: string; bg: string }> = {
  planned:     { label: 'Planned',     color: 'rgb(var(--c-muted))',   bg: 'bg-muted/15 border-muted/30' },
  'in-progress': { label: 'On the way!', color: 'rgb(var(--c-warning))', bg: 'bg-warning/15 border-warning/30' },
  done:        { label: 'Done ✅',      color: 'rgb(var(--c-primary))', bg: 'bg-primary/15 border-primary/30' },
  skipped:     { label: 'Skipped ❌',   color: 'rgb(var(--c-danger))',  bg: 'bg-danger/15 border-danger/30' },
}

export default function SpotCard({ spot, isAdmin, currentUser, onStatus, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)

  const typeConfig  = SPOT_TYPES.find((t) => t.value === spot.type)
  const statusConf  = STATUS_CONFIG[spot.status]
  const isDone      = spot.status === 'done'
  const isSkipped   = spot.status === 'skipped'
  const canManage   = isAdmin || spot.addedBy === currentUser

  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden card-hover ${
        isDone    ? 'bg-primary/[0.08] border-primary/30' :
        isSkipped ? 'bg-surface/50 border-subtle/50 opacity-60' :
                    'bg-surface border-subtle hover:border-primary/30'
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        {/* Type icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
          isDone ? 'bg-primary/20' : 'bg-subtle'
        }`}>
          {typeConfig?.emoji ?? '📍'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`font-heading font-semibold text-sm truncate ${isDone ? 'text-primary' : 'text-foreground'} ${isSkipped ? 'line-through' : ''}`}>
                {spot.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {spot.scheduledTime && (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Clock size={10} /> {spot.scheduledTime}
                  </span>
                )}
                {spot.markedBy && isDone && (
                  <span className="text-xs text-primary/70">marked by {spot.markedBy}</span>
                )}
              </div>
              {spot.description && (
                <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">{spot.description}</p>
              )}
            </div>

            {/* Status badge + admin actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConf.bg}`}
                style={{ color: statusConf.color }}>
                {statusConf.label}
              </span>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => onEdit(spot)} className="p-1 rounded-lg hover:bg-subtle text-muted hover:text-primary transition-colors">
                    <Pencil size={11} />
                  </button>
                  <button onClick={() => onDelete(spot._id)} className="p-1 rounded-lg hover:bg-subtle text-muted hover:text-danger transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {!isDone && !isSkipped && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onStatus(spot._id, 'done')}
                className="flex-1 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-lg text-xs font-medium transition-all"
              >
                ✅ Mark Done
              </button>
              {spot.status !== 'in-progress' && (
                <button
                  onClick={() => onStatus(spot._id, 'in-progress')}
                  className="px-3 py-1.5 bg-warning/15 hover:bg-warning/25 text-warning border border-warning/30 rounded-lg text-xs font-medium transition-all"
                >
                  🏃 Going
                </button>
              )}
              <button
                onClick={() => onStatus(spot._id, 'skipped')}
                className="px-3 py-1.5 bg-subtle hover:bg-danger/15 text-muted hover:text-danger border border-subtle hover:border-danger/30 rounded-lg text-xs transition-all"
              >
                ❌ Skip
              </button>
            </div>
          )}

          {/* Undo for done/skipped */}
          {(isDone || isSkipped) && (
            <button
              onClick={() => onStatus(spot._id, 'planned')}
              className="mt-2 text-xs text-muted hover:text-foreground transition-colors underline underline-offset-2"
            >
              Undo
            </button>
          )}
        </div>
      </div>

      {/* Fun fact toggle */}
      {spot.funFact && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2 border-t border-subtle/50 text-muted hover:text-foreground text-xs transition-colors"
          >
            <span>💡 Fun fact</span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expanded && (
            <div className="px-4 pb-3">
              <p className="text-xs text-muted italic leading-relaxed bg-subtle/40 rounded-lg px-3 py-2">
                &ldquo;{spot.funFact}&rdquo;
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export type { SpotDoc }
