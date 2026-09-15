import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ScheduleItem } from '../lib/types'
import { EmptyState } from './Programs'

export default function Schedule() {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('schedule_items')
      .select('*')
      .order('starts_at')
      .then(({ data }) => {
        setItems((data as ScheduleItem[]) ?? [])
        setLoading(false)
      })
  }, [])

  const groups = items.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
    const day = new Date(item.starts_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    acc[day] = acc[day] || []
    acc[day].push(item)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
      <h1 className="display font-bold text-4xl md:text-5xl fade-up">Schedule</h1>
      <p className="mt-3 fade-up" style={{ color: 'var(--muted)', animationDelay: '0.05s' }}>When and where each program happens.</p>

      <div className="mt-10 space-y-10">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          Object.entries(groups).map(([day, dayItems]) => (
            <div key={day}>
              <h2 className="display font-semibold text-xl mb-4" style={{ color: 'var(--silver)' }}>{day}</h2>
              <ul className="space-y-3">
                {dayItems.map((item) => (
                  <li key={item.id} className="hover-lift flex gap-5 p-4 rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
                    <div className="w-20 shrink-0 text-sm" style={{ color: 'var(--muted)' }}>
                      {new Date(item.starts_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.venue && <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{item.venue}</p>}
                      {item.notes && <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{item.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
