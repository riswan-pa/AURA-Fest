import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Program, ProgramParticipant, Result, Student } from '../../lib/types'
import { Modal, Field, inputClass, inputStyle } from '../../components/admin/Modal'

export default function AdminResults() {
  const [results, setResults] = useState<Result[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [participants, setParticipants] = useState<ProgramParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Result | 'new' | null>(null)

  async function load() {
    const [{ data: r }, { data: p }, { data: s }, { data: pp }] = await Promise.all([
      supabase.from('results').select('*').order('created_at', { ascending: false }),
      supabase.from('programs').select('*').order('name'),
      supabase.from('students').select('*'),
      supabase.from('program_participants').select('*'),
    ])
    setResults((r as Result[]) ?? [])
    setPrograms((p as Program[]) ?? [])
    setStudents((s as Student[]) ?? [])
    setParticipants((pp as ProgramParticipant[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? '—'
  const studentName = (id: string | null) => students.find((s) => s.id === id)?.name ?? '—'

  async function remove(id: string) {
    if (!confirm('Delete this result?')) return
    await supabase.from('results').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="display font-bold text-3xl">Results</h1>
        <button
          onClick={() => setEditing('new')}
          className="text-sm px-4 py-2 rounded-full font-medium"
          style={{ background: 'var(--paper)', color: 'var(--ink)' }}
        >
          Add result
        </button>
      </div>
      <p style={{ color: 'var(--muted)' }}>Record placements, grades and points.</p>

      <div className="mt-6">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : results.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No results yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {results.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div className="text-sm">
                  <p>{programName(r.program_id)} — {studentName(r.student_id)}</p>
                  <p style={{ color: 'var(--muted)' }}>{r.position ? `${r.position} place` : ''} {r.grade ?? ''} {r.points ? `· ${r.points} pts` : ''}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => setEditing(r)} style={{ color: 'var(--silver)' }}>Edit</button>
                  <button onClick={() => remove(r.id)} style={{ color: 'var(--red)' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <ResultForm
          result={editing === 'new' ? null : editing}
          programs={programs}
          participants={participants}
          students={students}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function ResultForm({
  result,
  programs,
  participants,
  students,
  onClose,
  onSaved,
}: {
  result: Result | null
  programs: Program[]
  participants: ProgramParticipant[]
  students: Student[]
  onClose: () => void
  onSaved: () => void
}) {
  const [programId, setProgramId] = useState(result?.program_id ?? '')
  const [studentId, setStudentId] = useState(result?.student_id ?? '')
  const [position, setPosition] = useState(result?.position?.toString() ?? '')
  const [grade, setGrade] = useState(result?.grade ?? '')
  const [points, setPoints] = useState(result?.points?.toString() ?? '0')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eligible = participants.filter((pp) => pp.program_id === programId)

  async function save() {
    setSaving(true)
    setError(null)
    const payload = {
      program_id: programId,
      student_id: studentId || null,
      position: position ? Number(position) : null,
      grade: grade || null,
      points: points ? Number(points) : 0,
    }
    const { error } = result
      ? await supabase.from('results').update(payload).eq('id', result.id)
      : await supabase.from('results').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  return (
    <Modal title={result ? 'Edit result' : 'Add result'} onClose={onClose}>
      <Field label="Program">
        <select value={programId} onChange={(e) => { setProgramId(e.target.value); setStudentId('') }} className={inputClass} style={inputStyle}>
          <option value="">Select…</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Student">
        <select value={studentId ?? ''} onChange={(e) => setStudentId(e.target.value)} className={inputClass} style={inputStyle}>
          <option value="">Select…</option>
          {eligible.map((pp) => {
            const s = students.find((st) => st.id === pp.student_id)
            return s ? <option key={s.id} value={s.id}>{s.name}</option> : null
          })}
        </select>
      </Field>
      <Field label="Position (1–3, optional)">
        <input type="number" min={1} max={3} value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>
      <Field label="Grade (optional)">
        <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="A / B / C" className={inputClass} style={inputStyle} />
      </Field>
      <Field label="Points">
        <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>
      {error && <p className="text-sm mb-3" style={{ color: 'var(--red)' }}>{error}</p>}
      <button
        onClick={save}
        disabled={saving || !programId}
        className="w-full py-2.5 rounded-lg font-medium disabled:opacity-60"
        style={{ background: 'var(--paper)', color: 'var(--ink)' }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  )
}
