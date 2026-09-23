import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Program, Result, Student, Team } from '../../lib/types'

const tables = ['teams', 'students', 'programs', 'results', 'schedule_items', 'gallery_images'] as const

export default function Overview() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [teams, setTeams] = useState<Team[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [programs, setPrograms] = useState<Record<string, Program>>({})
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tables.forEach(async (t) => {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true })
      setCounts((c) => ({ ...c, [t]: count ?? 0 }))
    })

    async function load() {
      const [{ data: t }, { data: s }, { data: p }, { data: r }] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('students').select('*'),
        supabase.from('programs').select('*'),
        supabase.from('results').select('*').order('created_at', { ascending: false }),
      ])
      setTeams((t as Team[]) ?? [])
      setStudents((s as Student[]) ?? [])
      const pm: Record<string, Program> = {}
      ;((p as Program[]) ?? []).forEach((x) => (pm[x.id] = x))
      setPrograms(pm)
      setResults((r as Result[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Teams', key: 'teams' },
    { label: 'Students', key: 'students' },
    { label: 'Programs', key: 'programs' },
    { label: 'Results recorded', key: 'results' },
    { label: 'Schedule items', key: 'schedule_items' },
    { label: 'Gallery photos', key: 'gallery_images' },
  ]

  const studentTeam: Record<string, string | null> = {}
  students.forEach((s) => (studentTeam[s.id] = s.team_id))

  const teamPoints: Record<string, number> = {}
  teams.forEach((t) => (teamPoints[t.id] = 0))
  results.forEach((r) => {
    const teamId = r.team_id ?? (r.student_id ? studentTeam[r.student_id] : null)
    if (teamId && teamId in teamPoints) teamPoints[teamId] += r.points ?? 0
  })
  const standings = [...teams].sort((a, b) => (teamPoints[b.id] ?? 0) - (teamPoints[a.id] ?? 0))

  const studentName = (id: string | null) => (id ? students.find((s) => s.id === id)?.name ?? '—' : '—')
  const teamName = (id: string | null) => (id ? teams.find((t) => t.id === id)?.name ?? '—' : '—')
  const POSITION_LABEL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }

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

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div>
          <h2 className="display font-semibold text-xl mb-3">Team standings</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
            {loading ? (
              <p className="p-4 text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
            ) : standings.length === 0 ? (
              <p className="p-4 text-sm" style={{ color: 'var(--muted)' }}>No teams yet.</p>
            ) : (
              <ul>
                {standings.map((t, i) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between px-4 py-3 border-t first:border-t-0"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm w-5 text-right" style={{ color: 'var(--muted)' }}>{i + 1}</span>
                      <span className="chip rounded-full" style={{ background: t.color || 'var(--muted)', width: 10, height: 10 }} />
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <span className="display font-semibold" style={{ color: 'var(--yellow)' }}>
                      {teamPoints[t.id] ?? 0} <span className="text-xs font-normal" style={{ color: 'var(--muted)' }}>pts</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h2 className="display font-semibold text-xl mb-3">Recent results</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
            {loading ? (
              <p className="p-4 text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
            ) : results.length === 0 ? (
              <p className="p-4 text-sm" style={{ color: 'var(--muted)' }}>No results recorded yet.</p>
            ) : (
              <ul>
                {results.slice(0, 8).map((r) => (
                  <li key={r.id} className="px-4 py-3 border-t first:border-t-0" style={{ borderColor: 'var(--line)' }}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium truncate">{programs[r.program_id]?.name ?? 'Unknown program'}</p>
                      {r.position && (
                        <span className="text-xs shrink-0" style={{ color: 'var(--yellow)' }}>{POSITION_LABEL[r.position] ?? r.position}</span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {r.student_id ? studentName(r.student_id) : teamName(r.team_id)}
                      {r.grade ? ` · ${r.grade}` : ''}
                      {r.points ? ` · ${r.points} pts` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
