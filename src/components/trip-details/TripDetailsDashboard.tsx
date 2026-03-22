'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import JourneyFlowchart from './JourneyFlowchart'
import StaysSection, { type StayContent } from './StaysSection'
import RoutesSection, { type RoutesContent } from './RoutesSection'
import RulesSection, { type RulesContent } from './RulesSection'
import MumbaiSection, { type MumbaiContent } from './MumbaiSection'
import PackingList from './PackingList'
import TrainStatusSection from './TrainStatusSection'

interface TripDetailDoc {
  _id: string
  section: string
  title: string
  icon: string
  content: Record<string, unknown>
  order: number
}

interface Props {
  details: TripDetailDoc[]
}

const TABS = [
  { id: 'trains',        label: 'Journey',  emoji: '🚆' },
  { id: 'pnr',           label: 'Trains',   emoji: '🎫' },
  { id: 'stays',         label: 'Stays',    emoji: '🏨' },
  { id: 'routes',        label: 'Routes',   emoji: '🗺️' },
  { id: 'rules',         label: 'Rules',    emoji: '📜' },
  { id: 'mumbai_explore',label: 'Mumbai',   emoji: '🌆' },
  { id: 'packing',       label: 'Packing',  emoji: '🎒' },
]

export default function TripDetailsDashboard({ details }: Props) {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('trains')
  const [localDetails, setLocalDetails] = useState<TripDetailDoc[]>(details)
  const [saving, setSaving] = useState<string | null>(null)

  const getDetail = (section: string) => localDetails.find((d) => d.section === section)

  const updateSection = async (section: string, content: Record<string, unknown>) => {
    setSaving(section)
    // Optimistic update
    setLocalDetails((prev) =>
      prev.map((d) => (d.section === section ? { ...d, content } : d))
    )
    try {
      const res = await fetch(`/api/trip-details/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch {
      toast.error('Save failed. Try again.')
      // Revert
      setLocalDetails(details)
    } finally {
      setSaving(null)
    }
  }

  const trains       = getDetail('trains')
  const stayMatheran = getDetail('stay_matheran')
  const stayMumbai   = getDetail('stay_mumbai')
  const routes       = getDetail('routes')
  const rules        = getDetail('rules')
  const mumbai       = getDetail('mumbai_explore')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">🗺️ Trip Guide</h1>
        <p className="text-sm text-muted mt-1">Everything you need for Matheran 2026</p>
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="flex items-center gap-2 text-xs text-muted bg-subtle/40 rounded-lg px-3 py-2 w-fit">
          <div className="w-3 h-3 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
          Saving changes…
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-fg font-bold'
                : 'bg-surface border border-subtle text-muted hover:text-foreground hover:border-primary/40'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'trains' && trains && (
          <JourneyFlowchart
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={trains.content as any}
            onUpdate={(c) => updateSection('trains', c as unknown as Record<string, unknown>)}
          />
        )}

        {activeTab === 'stays' && stayMatheran && stayMumbai && (
          <StaysSection
            matheranTitle={stayMatheran.title}
            matheranIcon={stayMatheran.icon}
            matheranContent={stayMatheran.content as unknown as StayContent}
            mumbaiTitle={stayMumbai.title}
            mumbaiIcon={stayMumbai.icon}
            mumbaiContent={stayMumbai.content as unknown as StayContent}
            isAdmin={isAdmin}
            onUpdateMatheran={(c) => updateSection('stay_matheran', c as unknown as Record<string, unknown>)}
            onUpdateMumbai={(c) => updateSection('stay_mumbai', c as unknown as Record<string, unknown>)}
          />
        )}

        {activeTab === 'routes' && routes && (
          <RoutesSection content={routes.content as unknown as RoutesContent} />
        )}

        {activeTab === 'rules' && rules && (
          <RulesSection
            content={rules.content as unknown as RulesContent}
            onUpdate={(c) => updateSection('rules', c as unknown as Record<string, unknown>)}
          />
        )}

        {activeTab === 'mumbai_explore' && mumbai && (
          <MumbaiSection content={mumbai.content as unknown as MumbaiContent} />
        )}

        {activeTab === 'pnr' && (
          <TrainStatusSection />
        )}

        {activeTab === 'packing' && (
          <PackingList />
        )}
      </div>
    </div>
  )
}
