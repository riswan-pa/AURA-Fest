import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { SiteSettings } from '../../lib/types'
import { inputClass, inputStyle } from '../../components/admin/Modal'

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => setSettings(data as SiteSettings))
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    setSaved(false)
    await supabase
      .from('site_settings')
      .update({ fest_title: settings.fest_title, tagline: settings.tagline, about: settings.about })
      .eq('id', true)
    setSaving(false)
    setSaved(true)
  }

  if (!settings) return <p style={{ color: 'var(--muted)' }}>Loading…</p>

  return (
    <div>
      <h1 className="display font-bold text-3xl mb-1">Settings</h1>
      <p style={{ color: 'var(--muted)' }}>Text shown on the site's home page.</p>

      <div className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--silver)' }}>Fest title</label>
          <input value={settings.fest_title} onChange={(e) => setSettings({ ...settings, fest_title: e.target.value })} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--silver)' }}>Tagline</label>
          <input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--silver)' }}>About (optional)</label>
          <textarea rows={4} value={settings.about ?? ''} onChange={(e) => setSettings({ ...settings, about: e.target.value })} className={inputClass} style={inputStyle} />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
          style={{ background: 'var(--paper)', color: 'var(--ink)' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="ml-3 text-sm" style={{ color: 'var(--muted)' }}>Saved.</span>}
      </div>
    </div>
  )
}
