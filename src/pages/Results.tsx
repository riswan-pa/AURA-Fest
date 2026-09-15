import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Program, Result, Student, Team } from '../lib/types'
import { CategoryTag } from '../components/CategoryTag'
import { EmptyState } from './Programs'

const POSITION_LABEL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }

export default function Results() {
  const [results, setResults] = useState<Result[]>([])
  const [programs, setPrograms] = useState<Record<string, Program>>({})
  const [students, setStudents] = useState<Record<string, Student>>({})
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: r }, { data: p }, { data: s }, { data: t }] = await Promise.all([
        supabase.from('results').select('*').order('created_at', { ascending: false }),
        supabase.from('programs').select('*'),
        supabase.from('students').select('*'),
        supabase.from('teams').select('*'),
      ])
      setResults((r as Result[]) ?? [])
      const pm: Record<string, Program> = {}
      ;((p as Program[]) ?? []).forEach((x) => (pm[x.id] = x))
      setPrograms(pm)
      const sm: Record<string, Student> = {}
      ;((s as Student[]) ?? []).forEach((x) => (sm[x.id] = x))
      setStudents(sm)
      const tm: Record<string, Team> = {}
      ;((t as Team[]) ?? []).forEach((x) => (tm[x.id] = x))
      setTeams(tm)
      setLoading(false)
    }
    load()
  }, [])

  const grouped = results.reduce<Record<string, Result[]>>((acc, r) => {
    acc[r.program_id] = acc[r.program_id] || []
    acc[r.program_id].push(r)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
      <h1 className="display font-bold text-4xl md:text-5xl fade-up">Results</h1>
      <p className="mt-3 fade-up" style={{ color: 'var(--muted)', animationDelay: '0.05s' }}>Winners and grades as they're announced.</p>

      <div className="mt-10 space-y-6">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState message="No results announced yet." />
        ) : (
          Object.entries(grouped).map(([programId, rows]) => {
            const program = programs[programId]
            if (!program) return null
            return (
              <div key={programId} className="hover-lift p-5 rounded-2xl border" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <h3 className="font-medium text-lg">{program.name}</h3>
                  <CategoryTag category={program.category} />
                </div>
                <ul className="space-y-2">
                  {rows
                    .sort((a, b) => (a.position ?? 9) - (b.position ?? 9))
                    .map((r) => (
                      <li key={r.id} className="flex items-center justify-between text-sm">
                        <span>
                          {r.position && <strong style={{ color: 'var(--yellow)' }}>{POSITION_LABEL[r.position] ?? r.position} · </strong>}
                          {r.student_id ? students[r.student_id]?.name : r.team_id ? teams[r.team_id]?.name : '—'}
                        </span>
                        <span style={{ color: 'var(--muted)' }}>{r.grade ?? ''} {r.points ? `· ${r.points} pts` : ''}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
