import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const tables = ['teams', 'students', 'programs', 'results', 'schedule_items', 'gallery_images'] as const

export default function Overview() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    tables.forEach(async (t) => {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true })
      setCounts((c) => ({ ...c, [t]: count ?? 0 }))
    })
  }, [])

  const cards = [
    { label: 'Teams', key: 'teams' },
    { label: 'Students', key: 'students' },
    { label: 'Programs', key: 'programs' },
    { label: 'Results recorded', key: 'results' },
    { label: 'Schedule items', key: 'schedule_items' },
    { label: 'Gallery photos', key: 'gallery_images' },
  ]

  return (
    <div>
      <h1 className="display font-bold text-3xl mb-1">Overview</h1>
      <p style={{ color: 'var(--muted)' }}>A snapshot of what's in the system.</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {cards.map((c) => (
          <div key={c.key} className="p-5 rounded-2xl border" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
            <p className="text-3xl font-semibold display">{counts[c.key] ?? '—'}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
