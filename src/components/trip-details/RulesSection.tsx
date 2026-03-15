'use client'

import { useState } from 'react'
import { Shield, Pencil, Plus, Trash2 } from 'lucide-react'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#F4A261]" />
          <h3 className="font-heading font-bold text-[#E8F5E9]">Group Constitution</h3>
          <span className="text-xs text-[#A0AEC0] bg-[#0F3460] px-2 py-0.5 rounded-full">law is law 📜</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4A261]/10 border border-[#F4A261]/30 rounded-lg text-[#F4A261] text-xs hover:bg-[#F4A261]/20 transition-all"
          >
            <Plus size={12} /> Add Rule
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {content.rules.map((rule, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 bg-[#16213E] border border-[#0F3460] rounded-xl group hover:border-[#0F3460]/80 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F3460] flex items-center justify-center text-base flex-shrink-0">
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
                    className="flex-1 px-2 py-1 bg-[#1A1A2E] border border-[#52B788] rounded-lg text-[#E8F5E9] text-xs focus:outline-none"
                  />
                  <button onClick={saveEdit} className="text-[#52B788] text-xs font-bold px-2 hover:text-[#2D6A4F]">✓</button>
                  <button onClick={() => setEditingIdx(null)} className="text-[#A0AEC0] text-xs px-1 hover:text-[#E8F5E9]">✕</button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-[#A0AEC0] font-mono mt-0.5 flex-shrink-0">#{i + 1}</span>
                  <p className="text-sm text-[#E8F5E9] flex-1">{rule}</p>
                </div>
              )}
            </div>
            {isAdmin && editingIdx !== i && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(i)}
                  className="p-1.5 rounded-lg hover:bg-[#0F3460] text-[#A0AEC0] hover:text-[#52B788]"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => deleteRule(i)}
                  className="p-1.5 rounded-lg hover:bg-[#0F3460] text-[#A0AEC0] hover:text-[#E63946]"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding && (
        <div className="bg-[#16213E] border border-[#F4A261]/30 rounded-xl p-4 space-y-3 animate-fade-in">
          <input
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRule()}
            placeholder="Type the new rule..."
            autoFocus
            className="w-full px-3 py-2 bg-[#1A1A2E] border border-[#0F3460] rounded-lg text-[#E8F5E9] placeholder-[#A0AEC0]/40 text-sm focus:outline-none focus:border-[#F4A261]"
          />
          <div className="flex gap-2">
            <button
              onClick={addRule}
              disabled={!newRule.trim()}
              className="flex-1 py-2 bg-[#F4A261] hover:bg-[#E76F51] text-[#1A1A2E] font-bold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              Add Rule
            </button>
            <button
              onClick={() => { setAdding(false); setNewRule('') }}
              className="px-4 py-2 border border-[#0F3460] rounded-lg text-[#A0AEC0] text-sm hover:border-[#A0AEC0] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="p-4 bg-[#F4A261]/5 border border-[#F4A261]/20 rounded-xl">
        <p className="text-xs text-[#F4A261] italic">
          ⚠️ Breaking any rule results in buying chai for the whole group. No exceptions. The constitution is final. Appealing to Saumyajeet will not help. Probably.
        </p>
      </div>
    </div>
  )
}
