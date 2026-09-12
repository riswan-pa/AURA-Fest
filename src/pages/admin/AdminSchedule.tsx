import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Program, ScheduleItem } from '../../lib/types'
import { Modal, Field, inputClass, inputStyle } from '../../components/admin/Modal'

export default function AdminSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ScheduleItem | 'new' | null>(null)

  async function load() {
    const [{ data: i }, { data: p }] = await Promise.all([
      supabase.from('schedule_items').select('*').order('starts_at'),
      supabase.from('programs').select('*').order('name'),
    ])
    setItems((i as ScheduleItem[]) ?? [])
    setPrograms((p as Program[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function remove(id: string) {
    if (!confirm('Delete this schedule item?')) return
    await supabase.from('schedule_items').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="display font-bold text-3xl">Schedule</h1>
        <button onClick={() => setEditing('new')} className="text-sm px-4 py-2 rounded-full font-medium" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
          Add item
        </button>
      </div>
      <p style={{ color: 'var(--muted)' }}>When and where things happen.</p>

      <div className="mt-6">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No schedule items yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {items.map((it) => (
              <li key={it.id} className="py-3 flex items-center justify-between">
                <div className="text-sm">
                  <p>{it.title}</p>
                  <p style={{ color: 'var(--muted)' }}>{new Date(it.starts_at).toLocaleString()} {it.venue ? `· ${it.venue}` : ''}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => setEditing(it)} style={{ color: 'var(--silver)' }}>Edit</button>
                  <button onClick={() => remove(it.id)} style={{ color: 'var(--red)' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <ScheduleForm
          item={editing === 'new' ? null : editing}
          programs={programs}
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

function ScheduleForm({
  item,
  programs,
  onClose,
  onSaved,
}: {
  item: ScheduleItem | null
  programs: Program[]
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [programId, setProgramId] = useState(item?.program_id ?? '')
  const [startsAt, setStartsAt] = useState(item ? toLocalInput(item.starts_at) : '')
  const [venue, setVenue] = useState(item?.venue ?? '')
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toLocalInput(iso: string) {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  async function save() {
    if (!startsAt) {
      setError('Pick a date and time.')
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      title,
      program_id: programId || null,
      starts_at: new Date(startsAt).toISOString(),
      venue: venue || null,
      notes: notes || null,
    }
    const { error } = item
      ? await supabase.from('schedule_items').update(payload).eq('id', item.id)
      : await supabase.from('schedule_items').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  return (
    <Modal title={item ? 'Edit item' : 'Add schedule item'} onClose={onClose}>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} autoFocus />
      </Field>
      <Field label="Linked program (optional)">
        <select value={programId ?? ''} onChange={(e) => setProgramId(e.target.value)} className={inputClass} style={inputStyle}>
          <option value="">None</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Date & time">
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>
      <Field label="Venue">
        <input value={venue} onChange={(e) => setVenue(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>
      <Field label="Notes">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} style={inputStyle} rows={2} />
      </Field>
      {error && <p className="text-sm mb-3" style={{ color: 'var(--red)' }}>{error}</p>}
      <button
        onClick={save}
        disabled={saving || !title}
        className="w-full py-2.5 rounded-lg font-medium disabled:opacity-60"
        style={{ background: 'var(--paper)', color: 'var(--ink)' }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  )
}
