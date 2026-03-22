'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRealtime } from '@/hooks/useRealtime'
import { Plus, Trash2, BarChart3, Clock, Users, X, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface PollOption {
  text: string
  votes: string[]
}

interface Poll {
  _id: string
  question: string
  options: PollOption[]
  createdBy: string
  allowMultiple: boolean
  isAnonymous: boolean
  expiresAt: string | null
  createdAt: string
}

export default function PollsDashboard() {
  const { user, isAdmin } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [creating, setCreating] = useState(false)

  const memberName = user?.name ?? user?.username ?? ''

  const fetchPolls = useCallback(async () => {
    try {
      const res = await fetch('/api/polls')
      const data = await res.json()
      setPolls(data.polls ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPolls() }, [fetchPolls])
  useRealtime(['poll'], fetchPolls)

  const createPoll = async () => {
    if (!question.trim()) { toast.error('Question likhna toh padega 📝'); return }
    const validOpts = options.filter((o) => o.trim())
    if (validOpts.length < 2) { toast.error('Kam se kam 2 options daal 🤔'); return }

    setCreating(true)
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          options: validOpts,
          allowMultiple,
          isAnonymous,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setPolls((prev) => [data.poll, ...prev])
        setQuestion('')
        setOptions(['', ''])
        setAllowMultiple(false)
        setIsAnonymous(false)
        setShowCreate(false)
        toast.success('📊 Poll created!')
      }
    } finally {
      setCreating(false)
    }
  }

  const vote = async (pollId: string, optionIndex: number) => {
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionIndex }),
    })
    if (res.ok) {
      const data = await res.json()
      setPolls((prev) => prev.map((p) => (p._id === pollId ? data.poll : p)))
    } else {
      const data = await res.json()
      toast.error(data.error ?? 'Vote failed')
    }
  }

  const deletePoll = async (id: string) => {
    if (!confirm('Delete this poll?')) return
    const res = await fetch(`/api/polls/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPolls((prev) => prev.filter((p) => p._id !== id))
      toast.success('🗑️ Poll deleted')
    }
  }

  const addOption = () => {
    if (options.length >= 8) return
    setOptions([...options, ''])
  }

  const removeOption = (idx: number) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== idx))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-foreground">Polls 📊</h1>
          <p className="text-xs text-muted mt-0.5">Vote karo, decide karo</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-primary-fg font-heading font-bold rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> New Poll
        </button>
      </div>

      {/* Create Poll Form */}
      {showCreate && (
        <div className="bg-surface border border-subtle rounded-2xl p-5 mb-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-foreground">Create Poll</h2>
            <button onClick={() => setShowCreate(false)} className="text-muted hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's the question? e.g. Dinner kahan chalein?"
            className="w-full px-4 py-2.5 bg-base border border-subtle rounded-xl text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted">Options</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...options]
                    next[i] = e.target.value
                    setOptions(next)
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="p-2 text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {options.length < 8 && (
              <button
                onClick={addOption}
                className="text-xs text-primary hover:text-primary-dark transition-colors"
              >
                + Add option
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="accent-primary"
              />
              Allow multiple votes
            </label>
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="accent-primary"
              />
              Anonymous votes
            </label>
          </div>

          <button
            onClick={createPoll}
            disabled={creating}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-primary-fg font-bold rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Poll 📊'}
          </button>
        </div>
      )}

      {/* Polls List */}
      <div className="space-y-4">
        {polls.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-2">📊</p>
            <p className="font-heading font-bold text-primary">Koi poll nahi abhi</p>
            <p className="text-xs text-muted mt-1">Create a poll to get everyone&apos;s opinion!</p>
          </div>
        ) : (
          polls.map((poll) => {
            const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0)
            const isExpired = poll.expiresAt ? new Date() > new Date(poll.expiresAt) : false
            const myVotes = poll.options.map((o) => o.votes.includes(memberName))

            return (
              <div key={poll._id} className="bg-surface border border-subtle rounded-2xl p-5 space-y-4">
                {/* Question header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-heading font-bold text-foreground">{poll.question}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px] text-muted flex items-center gap-1">
                        <Users size={9} /> {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] text-muted">by {poll.createdBy}</span>
                      {poll.allowMultiple && (
                        <span className="text-[10px] text-info bg-info/10 px-1.5 py-0.5 rounded-full">multi</span>
                      )}
                      {poll.isAnonymous && (
                        <span className="text-[10px] text-purple bg-purple/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Lock size={8} /> anonymous
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-[10px] text-danger bg-danger/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Clock size={8} /> expired
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => deletePoll(poll._id)}
                      className="p-1.5 text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {poll.options.map((opt, i) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0
                    const voted = myVotes[i]
                    const isWinning = opt.votes.length === Math.max(...poll.options.map((o) => o.votes.length)) && opt.votes.length > 0

                    return (
                      <button
                        key={i}
                        onClick={() => !isExpired && vote(poll._id, i)}
                        disabled={isExpired}
                        className={`relative w-full text-left px-4 py-3 rounded-xl border transition-all overflow-hidden ${
                          voted
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-subtle bg-base hover:border-primary/30'
                        } ${isExpired ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                      >
                        {/* Progress bar background */}
                        <div
                          className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-xl ${
                            isWinning ? 'bg-primary/15' : 'bg-subtle/50'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${voted ? 'text-primary' : 'text-foreground'}`}>
                              {opt.text}
                            </span>
                            {voted && <span className="text-[10px] text-primary">✓</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isWinning ? 'text-primary' : 'text-muted'}`}>
                              {pct}%
                            </span>
                            <span className="text-[10px] text-muted">
                              ({opt.votes.length})
                            </span>
                          </div>
                        </div>
                        {/* Voters list (if not anonymous) */}
                        {!poll.isAnonymous && opt.votes.length > 0 && (
                          <p className="relative text-[10px] text-muted mt-1">
                            {opt.votes.join(', ')}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-1.5">
                  <BarChart3 size={10} className="text-muted" />
                  <span className="text-[10px] text-muted">
                    {new Date(poll.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
