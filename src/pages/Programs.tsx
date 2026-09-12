import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, Program, ProgramParticipant, Student } from '../lib/types'
import { CATEGORIES, CATEGORY_LABEL } from '../lib/types'
import { CategoryTag } from '../components/CategoryTag'

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [participants, setParticipants] = useState<ProgramParticipant[]>([])
  const [students, setStudents] = useState<Record<string, Student>>({})
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: pp }, { data: s }] = await Promise.all([
        supabase.from('programs').select('*').order('category').order('name'),
        supabase.from('program_participants').select('*'),
        supabase.from('students').select('*'),
      ])
      setPrograms((p as Program[]) ?? [])
      setParticipants((pp as ProgramParticipant[]) ?? [])
      const map: Record<string, Student> = {}
      ;((s as Student[]) ?? []).forEach((st) => (map[st.id] = st))
      setStudents(map)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [programs, activeCategory, query])

  const participantsFor = (programId: string) =>
    participants.filter((pp) => pp.program_id === programId).map((pp) => students[pp.student_id]).filter(Boolean)

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
      <h1 className="display font-bold text-4xl md:text-5xl">Programs</h1>
      <p className="mt-3" style={{ color: 'var(--muted)' }}>Items our college is entering, organized by category.</p>

      <div className="mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} label="All" />
          {CATEGORIES.map((c) => (
            <FilterChip key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} label={CATEGORY_LABEL[c]} />
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search programs…"
          className="px-4 py-2 rounded-full text-sm bg-transparent border outline-none w-full md:w-64"
          style={{ borderColor: 'var(--line)' }}
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {filtered.map((p) => {
              const pts = participantsFor(p.id)
              return (
                <li key={p.id} className="py-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 border-t first:border-t-0" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-lg">{p.name}</h3>
                      <CategoryTag category={p.category} />
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
                        {p.kind === 'group' ? 'Group' : 'Individual'} · {p.mode === 'on_stage' ? 'On stage' : 'Off stage'}
                      </span>
                    </div>
                    {pts.length > 0 && (
                      <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
                        {pts.map((s) => s.name).join(', ')}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-sm px-3.5 py-1.5 rounded-full border transition-colors"
      style={{
        borderColor: active ? 'var(--paper)' : 'var(--line)',
        background: active ? 'var(--paper)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--silver)',
      }}
    >
      {label}
    </button>
  )
}

export function EmptyState({ message = 'Nothing here yet — check back once entries are added.' }: { message?: string }) {
  return (
    <div className="py-16 text-center border rounded-2xl" style={{ borderColor: 'var(--line)' }}>
      <p style={{ color: 'var(--muted)' }}>{message}</p>
    </div>
  )
}
