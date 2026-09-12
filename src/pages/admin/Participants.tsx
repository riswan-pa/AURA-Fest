import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Program, ProgramParticipant, Student } from '../../lib/types'
import { CsvImport } from '../../components/admin/CsvImport'

export default function Participants() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [participants, setParticipants] = useState<ProgramParticipant[]>([])
  const [programId, setProgramId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [chestNo, setChestNo] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const [{ data: p }, { data: s }, { data: pp }] = await Promise.all([
      supabase.from('programs').select('*').order('name'),
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

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? '—'
  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? '—'

  const grouped = useMemo(() => {
    const map = new Map<string, ProgramParticipant[]>()
    participants.forEach((pp) => {
      const list = map.get(pp.program_id) ?? []
      list.push(pp)
      map.set(pp.program_id, list)
    })
    return map
  }, [participants])

  async function addLink() {
    if (!programId || !studentId) return
    const { error } = await supabase.from('program_participants').insert({
      program_id: programId,
      student_id: studentId,
      chest_no: chestNo || null,
    })
    if (!error) {
      setStudentId('')
      setChestNo('')
      load()
    }
  }

  async function remove(id: string) {
    await supabase.from('program_participants').delete().eq('id', id)
    load()
  }

  async function importRows(rows: Record<string, string>[]) {
    let ok = 0
    let failed = 0
    const errors: string[] = []
    const programByName = new Map(programs.map((p) => [p.name.toLowerCase(), p.id]))
    const studentByName = new Map(students.map((s) => [s.name.toLowerCase(), s.id]))

    for (const row of rows) {
      const pName = row.program_name?.trim()
      const sName = row.student_name?.trim()
      const pId = pName ? programByName.get(pName.toLowerCase()) : undefined
      const sId = sName ? studentByName.get(sName.toLowerCase()) : undefined
      if (!pId || !sId) {
        failed++
        errors.push(`Could not match "${pName}" / "${sName}".`)
        continue
      }
      const { error } = await supabase.from('program_participants').insert({
        program_id: pId,
        student_id: sId,
        chest_no: row.chest_no?.trim() || null,
      })
      if (error) {
        failed++
      } else {
        ok++
      }
    }
    await load()
    return { ok, failed, errors }
  }

  return (
    <div>
      <h1 className="display font-bold text-3xl mb-1">Participants</h1>
      <p style={{ color: 'var(--muted)' }}>Which students are entered in which programs.</p>

      <div className="mt-6">
        <CsvImport
          label="Bulk import participants"
          columns={['program_name', 'student_name', 'chest_no']}
          onRows={importRows}
        />
      </div>

      <div className="mt-6 p-4 rounded-xl border flex flex-wrap gap-3 items-end" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Program</label>
          <select value={programId} onChange={(e) => setProgramId(e.target.value)} className="px-3 py-2 rounded-lg bg-transparent border text-sm" style={{ borderColor: 'var(--line)' }}>
            <option value="">Select…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Student</label>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="px-3 py-2 rounded-lg bg-transparent border text-sm" style={{ borderColor: 'var(--line)' }}>
            <option value="">Select…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Chest no.</label>
          <input value={chestNo} onChange={(e) => setChestNo(e.target.value)} className="px-3 py-2 rounded-lg bg-transparent border text-sm w-24" style={{ borderColor: 'var(--line)' }} />
        </div>
        <button onClick={addLink} className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
          Add
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          Array.from(grouped.entries()).map(([pid, list]) => (
            <div key={pid}>
              <h3 className="font-medium mb-2">{programName(pid)}</h3>
              <ul className="space-y-1">
                {list.map((pp) => (
                  <li key={pp.id} className="flex items-center justify-between text-sm py-1.5 border-b" style={{ borderColor: 'var(--line)' }}>
                    <span>{studentName(pp.student_id)} {pp.chest_no && <span style={{ color: 'var(--muted)' }}>· #{pp.chest_no}</span>}</span>
                    <button onClick={() => remove(pp.id)} style={{ color: 'var(--red)' }}>Remove</button>
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
