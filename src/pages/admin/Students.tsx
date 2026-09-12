import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Category, Student, Team } from '../../lib/types'
import { CATEGORIES, CATEGORY_LABEL } from '../../lib/types'
import { normalizeCategory } from '../../lib/csv'
import { Modal, Field, inputClass, inputStyle } from '../../components/admin/Modal'
import { CsvImport } from '../../components/admin/CsvImport'

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Student | 'new' | null>(null)
  const [query, setQuery] = useState('')

  async function load() {
    const [{ data: s }, { data: t }] = await Promise.all([
      supabase.from('students').select('*').order('name'),
      supabase.from('teams').select('*').order('name'),
    ])
    setStudents((s as Student[]) ?? [])
    setTeams((t as Team[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const teamName = (id: string | null) => teams.find((t) => t.id === id)?.name ?? '—'

  const filtered = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [students, query]
  )

  async function remove(id: string) {
    if (!confirm('Delete this student?')) return
    await supabase.from('students').delete().eq('id', id)
    load()
  }

  async function importRows(rows: Record<string, string>[]) {
    let ok = 0
    let failed = 0
    const errors: string[] = []
    const teamCache = new Map(teams.map((t) => [t.name.toLowerCase(), t.id]))

    for (const row of rows) {
      const name = row.name?.trim()
      const categoryRaw = row.category?.trim()
      if (!name || !categoryRaw) {
        failed++
        continue
      }
      const category = normalizeCategory(categoryRaw)
      if (!category) {
        failed++
        errors.push(`Unrecognized category "${categoryRaw}" for ${name}.`)
        continue
      }
      let teamId: string | null = null
      const teamName = row.team?.trim()
      if (teamName) {
        const key = teamName.toLowerCase()
        if (teamCache.has(key)) {
          teamId = teamCache.get(key)!
        } else {
          const { data, error } = await supabase.from('teams').insert({ name: teamName }).select().single()
          if (!error && data) {
            teamId = data.id
            teamCache.set(key, data.id)
          }
        }
      }
      const { error } = await supabase.from('students').insert({
        name,
        admission_no: row.admission_no?.trim() || null,
        class: row.class?.trim() || null,
        category,
        team_id: teamId,
      })
      if (error) {
        failed++
        errors.push(error.message)
      } else {
        ok++
      }
    }
    await load()
    return { ok, failed, errors }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="display font-bold text-3xl">Students</h1>
        <button
          onClick={() => setEditing('new')}
          className="text-sm px-4 py-2 rounded-full font-medium"
          style={{ background: 'var(--paper)', color: 'var(--ink)' }}
        >
          Add student
        </button>
      </div>
      <p style={{ color: 'var(--muted)' }}>Everyone your college is entering, with their team and category.</p>

      <div className="mt-6">
        <CsvImport
          label="Bulk import students"
          columns={['name', 'admission_no', 'class', 'category', 'team']}
          onRows={importRows}
        />
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search students…"
        className="mt-6 px-4 py-2 rounded-full text-sm bg-transparent border outline-none w-full md:w-72"
        style={{ borderColor: 'var(--line)' }}
      />

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No students found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
                <th className="py-2 pr-4 font-normal">Name</th>
                <th className="py-2 pr-4 font-normal">Category</th>
                <th className="py-2 pr-4 font-normal">Team</th>
                <th className="py-2 pr-4 font-normal">Class</th>
                <th className="py-2 pr-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-2.5 pr-4">{s.name}</td>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--silver)' }}>{CATEGORY_LABEL[s.category]}</td>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--silver)' }}>{teamName(s.team_id)}</td>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--silver)' }}>{s.class ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(s)} className="mr-3" style={{ color: 'var(--silver)' }}>Edit</button>
                    <button onClick={() => remove(s.id)} style={{ color: 'var(--red)' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <StudentForm
          student={editing === 'new' ? null : editing}
          teams={teams}
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

function StudentForm({
  student,
  teams,
  onClose,
  onSaved,
}: {
  student: Student | null
  teams: Team[]
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(student?.name ?? '')
  const [admissionNo, setAdmissionNo] = useState(student?.admission_no ?? '')
  const [klass, setKlass] = useState(student?.class ?? '')
  const [category, setCategory] = useState<Category>(student?.category ?? 'sub_junior')
  const [teamId, setTeamId] = useState(student?.team_id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    const payload = {
      name,
      admission_no: admissionNo || null,
      class: klass || null,
      category,
      team_id: teamId || null,
    }
    const { error } = student
      ? await supabase.from('students').update(payload).eq('id', student.id)
      : await supabase.from('students').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  return (
    <Modal title={student ? 'Edit student' : 'Add student'} onClose={onClose}>
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
      <Field label="Team">
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={inputClass} style={inputStyle}>
          <option value="">No team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Class / Grade">
        <input value={klass} onChange={(e) => setKlass(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>
      <Field label="Admission no.">
        <input value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} className={inputClass} style={inputStyle} />
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
