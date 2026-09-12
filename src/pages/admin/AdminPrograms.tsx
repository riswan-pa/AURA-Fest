import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Category, Program, ProgramKind, ProgramMode } from '../../lib/types'
import { CATEGORIES, CATEGORY_LABEL } from '../../lib/types'
import { Modal, Field, inputClass, inputStyle } from '../../components/admin/Modal'

export default function AdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Program | 'new' | null>(null)

  async function load() {
    const { data } = await supabase.from('programs').select('*').order('category').order('name')
    setPrograms((data as Program[]) ?? [])
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
      <p style={{ color: 'var(--muted)' }}>Items your college is entering.</p>

      <div className="mt-6">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : programs.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No programs yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {programs.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p>{p.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {CATEGORY_LABEL[p.category]} · {p.kind} · {p.mode.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => setEditing(p)} style={{ color: 'var(--silver)' }}>Edit</button>
                  <button onClick={() => remove(p.id)} style={{ color: 'var(--red)' }}>Delete</button>
                </div>
              </li>
            ))}
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
