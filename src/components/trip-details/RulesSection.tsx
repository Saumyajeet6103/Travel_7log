'use client'

import { useState, useRef } from 'react'
import { Shield, Pencil, Plus, Trash2, GripVertical } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

export interface RulesContent {
  rules: string[]
}

interface Props {
  content: RulesContent
  onUpdate: (c: RulesContent) => void
}

const RULE_EMOJIS = ['🚫', '💰', '☕', '🗺️', '🌅', '📸', '😴', '📱', '🤝', '🍺', '🎯', '⚡']

export default function RulesSection({ content, onUpdate }: Props) {
  const { isAdmin } = useAuth()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [adding, setAdding] = useState(false)
  const [newRule, setNewRule] = useState('')
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const dragNode = useRef<HTMLDivElement | null>(null)

  const startEdit = (i: number) => {
    setEditingIdx(i)
    setEditText(content.rules[i])
  }

  const saveEdit = () => {
    if (editingIdx === null || !editText.trim()) return
    const updated = [...content.rules]
    updated[editingIdx] = editText.trim()
    onUpdate({ rules: updated })
    setEditingIdx(null)
    toast.success('📜 Rule updated!')
  }

  const deleteRule = (i: number) => {
    onUpdate({ rules: content.rules.filter((_, idx) => idx !== i) })
    toast.success('Rule removed')
  }

  const addRule = () => {
    if (!newRule.trim()) return
    onUpdate({ rules: [...content.rules, newRule.trim()] })
    setNewRule('')
    setAdding(false)
    toast.success('📌 New rule added, bhai!')
  }

  // Drag handlers
  const handleDragStart = (idx: number, e: React.DragEvent<HTMLDivElement>) => {
    setDragIdx(idx)
    dragNode.current = e.currentTarget
    e.dataTransfer.effectAllowed = 'move'
    // Make drag image slightly transparent
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.4'
    }, 0)
  }

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = '1'
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const updated = [...content.rules]
      const [moved] = updated.splice(dragIdx, 1)
      updated.splice(overIdx, 0, moved)
      onUpdate({ rules: updated })
      toast.success('📜 Rules reordered!')
    }
    setDragIdx(null)
    setOverIdx(null)
    dragNode.current = null
  }

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overIdx !== idx) setOverIdx(idx)
  }

  // Touch drag support
  const touchStartY = useRef(0)
  const touchIdx = useRef<number | null>(null)

  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    if (!isAdmin) return
    touchStartY.current = e.touches[0].clientY
    touchIdx.current = idx
    setDragIdx(idx)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchIdx.current === null) return
    const touch = e.touches[0]
    const elements = Array.from(document.querySelectorAll('[data-rule-idx]'))
    for (const el of elements) {
      const rect = el.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const idx = parseInt(el.getAttribute('data-rule-idx') || '-1')
        if (idx >= 0 && idx !== overIdx) setOverIdx(idx)
        break
      }
    }
  }

  const handleTouchEnd = () => {
    if (touchIdx.current !== null && overIdx !== null && touchIdx.current !== overIdx) {
      const updated = [...content.rules]
      const [moved] = updated.splice(touchIdx.current, 1)
      updated.splice(overIdx, 0, moved)
      onUpdate({ rules: updated })
      toast.success('📜 Rules reordered!')
    }
    touchIdx.current = null
    setDragIdx(null)
    setOverIdx(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-warning" />
          <h3 className="font-heading font-bold text-foreground">Group Constitution</h3>
          <span className="text-xs text-muted bg-subtle px-2 py-0.5 rounded-full">law is law 📜</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 border border-warning/30 rounded-lg text-warning text-xs hover:bg-warning/20 transition-all"
          >
            <Plus size={12} /> Add Rule
          </button>
        )}
      </div>

      {isAdmin && (
        <p className="text-[10px] text-muted italic">Drag the grip handle to reorder rules</p>
      )}

      <div
        className="space-y-2.5"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {content.rules.map((rule, i) => (
          <div
            key={`rule-${i}`}
            data-rule-idx={i}
            draggable={isAdmin && editingIdx !== i}
            onDragStart={(e) => isAdmin && handleDragStart(i, e)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(i, e)}
            onTouchStart={(e) => handleTouchStart(i, e)}
            className={`flex items-start gap-3 p-4 bg-surface border rounded-xl group transition-all ${
              overIdx === i && dragIdx !== null && dragIdx !== i
                ? 'border-warning/60 bg-warning/5'
                : dragIdx === i
                  ? 'border-primary/40 opacity-50'
                  : 'border-subtle hover:border-subtle/80'
            }`}
          >
            {/* Drag handle */}
            {isAdmin && (
              <div className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-muted/40 hover:text-muted touch-none">
                <GripVertical size={14} />
              </div>
            )}

            <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center text-base flex-shrink-0">
              {RULE_EMOJIS[i % RULE_EMOJIS.length]}
            </div>
            <div className="flex-1 min-w-0">
              {editingIdx === i ? (
                <div className="flex gap-2">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                    className="flex-1 px-2 py-1 bg-base border border-primary rounded-lg text-foreground text-xs focus:outline-none"
                  />
                  <button onClick={saveEdit} className="text-primary text-xs font-bold px-2 hover:text-primary-dark">✓</button>
                  <button onClick={() => setEditingIdx(null)} className="text-muted text-xs px-1 hover:text-foreground">✕</button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-muted font-mono mt-0.5 flex-shrink-0">#{i + 1}</span>
                  <p className="text-sm text-foreground flex-1">{rule}</p>
                </div>
              )}
            </div>
            {isAdmin && editingIdx !== i && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(i)}
                  className="p-1.5 rounded-lg hover:bg-subtle text-muted hover:text-primary"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => deleteRule(i)}
                  className="p-1.5 rounded-lg hover:bg-subtle text-muted hover:text-danger"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding && (
        <div className="bg-surface border border-warning/30 rounded-xl p-4 space-y-3 animate-fade-in">
          <input
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRule()}
            placeholder="Type the new rule..."
            autoFocus
            className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 text-sm focus:outline-none focus:border-warning"
          />
          <div className="flex gap-2">
            <button
              onClick={addRule}
              disabled={!newRule.trim()}
              className="flex-1 py-2 bg-warning hover:bg-warning/80 text-primary-fg font-bold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              Add Rule
            </button>
            <button
              onClick={() => { setAdding(false); setNewRule('') }}
              className="px-4 py-2 border border-subtle rounded-lg text-muted text-sm hover:border-muted transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
        <p className="text-xs text-warning italic">
          ⚠️ Breaking any rule results in buying chai for the whole group. No exceptions. The constitution is final. Appealing to Saumyajeet will not help. Probably.
        </p>
      </div>
    </div>
  )
}
