import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Category, Program, ProgramKind, ProgramMode, ProgramParticipant, Student } from '../../lib/types'
import { CATEGORIES, CATEGORY_LABEL } from '../../lib/types'
import { Modal, Field, inputClass, inputStyle } from '../../components/admin/Modal'

export default function AdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [participants, setParticipants] = useState<ProgramParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Program | 'new' | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingToProgram, setAddingToProgram] = useState<Program | null>(null)
  const [editingParticipant, setEditingParticipant] = useState<{ program: Program; participant: ProgramParticipant } | null>(null)

  async function load() {
    const [{ data: p }, { data: s }, { data: pp }] = await Promise.all([
      supabase.from('programs').select('*').order('category').order('name'),
      supabase.from('students').select('*').order('name'),
      supabase.from('program_participants').select('*'),
    ])
    setPrograms((p as Program[]) ?? [])
    setStudents((s as Student[]) ?? [])
    setParticipants((pp as ProgramParticipant[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function remove(id: string) {
    if (!confirm('Delete this program? Linked participants and results will also be removed.')) return
    await supabase.from('programs').delete().eq('id', id)
    load()
  }

  async function removeParticipant(id: string) {
    if (!confirm('Remove this participant from the program?')) return
    await supabase.from('program_participants').delete().eq('id', id)
    load()
  }

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? '—'
  const participantsFor = (programId: string) => participants.filter((pp) => pp.program_id === programId)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="display font-bold text-3xl">Programs</h1>
        <button
          onClick={() => setEditing('new')}
          className="text-sm px-4 py-2 rounded-full font-medium"
          style={{ background: 'var(--paper)', color: 'var(--ink)' }}
        >
          Add program
        </button>
      </div>
      <p style={{ color: 'var(--muted)' }}>Items your college is entering. Tap a program to manage its participants.</p>

      <div className="mt-6">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : programs.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No programs yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {programs.map((p) => {
              const pts = participantsFor(p.id)
              const isOpen = expandedId === p.id
              return (
                <li key={p.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <button
                      className="flex-1 text-left"
                      onClick={() => setExpandedId(isOpen ? null : p.id)}
                    >
                      <p>{p.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {CATEGORY_LABEL[p.category]} · {p.kind} · {p.mode.replace('_', ' ')} ·{' '}
                        {pts.length === 0 ? 'no participants' : `${pts.length} participant${pts.length > 1 ? 's' : ''}`}
                      </p>
                    </button>
                    <div className="flex gap-4 text-sm shrink-0 ml-3">
                      <button onClick={() => setExpandedId(isOpen ? null : p.id)} style={{ color: 'var(--silver)' }}>
                        {isOpen ? 'Hide' : 'Manage'}
                      </button>
                      <button onClick={() => setEditing(p)} style={{ color: 'var(--silver)' }}>Edit</button>
                      <button onClick={() => remove(p.id)} style={{ color: 'var(--red)' }}>Delete</button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
                      {pts.length === 0 ? (
                        <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>No students entered yet.</p>
                      ) : (
                        <ul className="space-y-1.5 mb-3">
                          {pts.map((pp) => (
                            <li key={pp.id} className="flex items-center justify-between text-sm py-1">
                              <span>
                                {studentName(pp.student_id)}
                                {pp.chest_no && <span style={{ color: 'var(--muted)' }}> · #{pp.chest_no}</span>}
                              </span>
                              <span className="flex gap-3">
                                <button onClick={() => setEditingParticipant({ program: p, participant: pp })} style={{ color: 'var(--silver)' }}>
                                  Edit
                                </button>
                                <button onClick={() => removeParticipant(pp.id)} style={{ color: 'var(--red)' }}>
                                  Remove
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        onClick={() => setAddingToProgram(p)}
                        className="text-sm px-3.5 py-1.5 rounded-full border"
                        style={{ borderColor: 'var(--line)', color: 'var(--silver)' }}
                      >
                        + Add student
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {editing && (
        <ProgramForm
          program={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}

      {addingToProgram && (
        <ParticipantForm
          program={addingToProgram}
          students={students}
          existingStudentIds={participantsFor(addingToProgram.id).map((pp) => pp.student_id)}
          onClose={() => setAddingToProgram(null)}
          onSaved={() => {
            setAddingToProgram(null)
            load()
          }}
        />
      )}

      {editingParticipant && (
        <ParticipantForm
          program={editingParticipant.program}
          students={students}
          existingStudentIds={[]}
          participant={editingParticipant.participant}
          onClose={() => setEditingParticipant(null)}
          onSaved={() => {
            setEditingParticipant(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function ProgramForm({ program, onClose, onSaved }: { program: Program | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(program?.name ?? '')
  const [category, setCategory] = useState<Category>(program?.category ?? 'sub_junior')
  const [kind, setKind] = useState<ProgramKind>(program?.kind ?? 'individual')
  const [mode, setMode] = useState<ProgramMode>(program?.mode ?? 'on_stage')
  const [code, setCode] = useState(program?.code ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    const payload = { name, category, kind, mode, code: code || null }
    const { error } = program
      ? await supabase.from('programs').update(payload).eq('id', program.id)
      : await supabase.from('programs').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  return (
    <Modal title={program ? 'Edit program' : 'Add program'} onClose={onClose}>
      <Field label="Name">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} autoFocus />
      </Field>
      <Field label="Category">
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={inputClass} style={inputStyle}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
      </Field>
      <Field label="Type">
        <select value={kind} onChange={(e) => setKind(e.target.value as ProgramKind)} className={inputClass} style={inputStyle}>
          <option value="individual">Individual</option>
          <option value="group">Group</option>
        </select>
      </Field>
      <Field label="Stage">
        <select value={mode} onChange={(e) => setMode(e.target.value as ProgramMode)} className={inputClass} style={inputStyle}>
          <option value="on_stage">On stage</option>
          <option value="off_stage">Off stage</option>
        </select>
      </Field>
      <Field label="Code (optional)">
        <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>
      {error && <p className="text-sm mb-3" style={{ color: 'var(--red)' }}>{error}</p>}
      <button
        onClick={save}
        disabled={saving || !name}
        className="w-full py-2.5 rounded-lg font-medium disabled:opacity-60"
        style={{ background: 'var(--paper)', color: 'var(--ink)' }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  )
}

function ParticipantForm({
  program,
  students,
  existingStudentIds,
  participant,
  onClose,
  onSaved,
}: {
  program: Program
  students: Student[]
  existingStudentIds: string[]
  participant?: ProgramParticipant
  onClose: () => void
  onSaved: () => void
}) {
  const [studentId, setStudentId] = useState(participant?.student_id ?? '')
  const [chestNo, setChestNo] = useState(participant?.chest_no ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Students matching the program's category first, then everyone else.
  const sameCategory = students.filter((s) => s.category === program.category && !existingStudentIds.includes(s.id))
  const otherCategory = students.filter((s) => s.category !== program.category && !existingStudentIds.includes(s.id))

  async function save() {
    if (!studentId) {
      setError('Pick a student.')
      return
    }
    setSaving(true)
    setError(null)
    const { error } = participant
      ? await supabase.from('program_participants').update({ student_id: studentId, chest_no: chestNo || null }).eq('id', participant.id)
      : await supabase.from('program_participants').insert({ program_id: program.id, student_id: studentId, chest_no: chestNo || null })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  return (
    <Modal title={participant ? 'Edit participant' : `Add student to ${program.name}`} onClose={onClose}>
      <Field label="Student">
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass} style={inputStyle} autoFocus>
          <option value="">Select…</option>
          {participant && (
            <option value={participant.student_id}>{students.find((s) => s.id === participant.student_id)?.name}</option>
          )}
          {sameCategory.length > 0 && (
            <optgroup label={CATEGORY_LABEL[program.category]}>
              {sameCategory.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
          )}
          {otherCategory.length > 0 && (
            <optgroup label="Other categories">
              {otherCategory.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({CATEGORY_LABEL[s.category]})</option>
              ))}
            </optgroup>
          )}
        </select>
      </Field>
      <Field label="Chest no. (optional)">
        <input value={chestNo} onChange={(e) => setChestNo(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>
      {error && <p className="text-sm mb-3" style={{ color: 'var(--red)' }}>{error}</p>}
      <button
        onClick={save}
        disabled={saving || !studentId}
        className="w-full py-2.5 rounded-lg font-medium disabled:opacity-60"
        style={{ background: 'var(--paper)', color: 'var(--ink)' }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  )
}
