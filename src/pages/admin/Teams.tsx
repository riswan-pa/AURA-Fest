import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Team } from '../../lib/types'
import { Modal, Field, inputClass, inputStyle } from '../../components/admin/Modal'

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Team | 'new' | null>(null)

  async function load() {
    const { data } = await supabase.from('teams').select('*').order('name')
    setTeams((data as Team[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function remove(id: string) {
    if (!confirm('Delete this team? Students will keep their record but lose the team link.')) return
    await supabase.from('teams').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="display font-bold text-3xl">Teams</h1>
        <button
          onClick={() => setEditing('new')}
          className="text-sm px-4 py-2 rounded-full font-medium"
          style={{ background: 'var(--paper)', color: 'var(--ink)' }}
        >
          Add team
        </button>
      </div>
      <p style={{ color: 'var(--muted)' }}>Groups students compete under.</p>

      <div className="mt-6">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : teams.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No teams yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {teams.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="chip rounded-full" style={{ background: t.color || 'var(--muted)', width: 10, height: 10 }} />
                  <span>{t.name}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => setEditing(t)} style={{ color: 'var(--silver)' }}>Edit</button>
                  <button onClick={() => remove(t.id)} style={{ color: 'var(--red)' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <TeamForm
          team={editing === 'new' ? null : editing}
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

function TeamForm({ team, onClose, onSaved }: { team: Team | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(team?.name ?? '')
  const [color, setColor] = useState(team?.color ?? '#d8232a')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    const payload = { name, color }
    const { error } = team ? await supabase.from('teams').update(payload).eq('id', team.id) : await supabase.from('teams').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  return (
    <Modal title={team ? 'Edit team' : 'Add team'} onClose={onClose}>
      <Field label="Name">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} autoFocus />
      </Field>
      <Field label="Color">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 bg-transparent border-0" />
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
