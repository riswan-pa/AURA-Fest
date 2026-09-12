import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { SiteSettings } from '../lib/types'

const navCards = [
  { to: '/programs', title: 'Programs', desc: 'Every item our college is entering, by category.', color: 'var(--red)' },
  { to: '/schedule', title: 'Schedule', desc: 'Where and when each program takes place.', color: 'var(--yellow)' },
  { to: '/results', title: 'Results', desc: 'Winners and grades as they are announced.', color: 'var(--blue)' },
  { to: '/gallery', title: 'Gallery', desc: 'Moments from rehearsals and the stage.', color: '#7c5cff' },
]

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => setSettings(data as SiteSettings))
  }, [])

  return (
    <div>
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-28 pb-16 md:pb-24">
        <div className="flex items-center gap-2 mb-6" aria-hidden>
          <span className="chip" style={{ background: 'var(--red)', width: 22, height: 6 }} />
          <span className="chip" style={{ background: 'var(--yellow)', width: 22, height: 6 }} />
          <span className="chip" style={{ background: 'var(--blue)', width: 22, height: 6 }} />
        </div>
        <h1 className="display font-bold leading-[0.95]" style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)' }}>
          {settings?.fest_title ?? 'AURA'}
        </h1>
        <p className="mt-6 max-w-xl text-lg" style={{ color: 'var(--silver)' }}>
          {settings?.tagline ?? 'Art. Ideas. People. Culture. Beyond.'}
        </p>
        <p className="mt-3 max-w-xl text-sm" style={{ color: 'var(--muted)' }}>
          Tracking our college's entries across programs, teams and categories — Sub Junior through Super Senior.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            to="/programs"
            className="px-5 py-3 text-sm font-medium rounded-full"
            style={{ background: 'var(--paper)', color: 'var(--ink)' }}
          >
            View programs
          </Link>
          <Link
            to="/schedule"
            className="px-5 py-3 text-sm font-medium rounded-full border"
            style={{ borderColor: 'var(--line)' }}
          >
            See schedule
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {navCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group p-5 rounded-2xl border flex flex-col justify-between min-h-[150px] transition-colors"
              style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}
            >
              <span className="chip rounded-full" style={{ background: c.color, width: 10, height: 10 }} />
              <div>
                <h3 className="display font-semibold text-lg mt-6 group-hover:text-white">{c.title}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {settings?.about && (
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-24">
          <div className="max-w-2xl">
            <h2 className="display font-semibold text-2xl mb-4">About</h2>
            <p style={{ color: 'var(--silver)' }}>{settings.about}</p>
          </div>
        </section>
      )}
    </div>
  )
}
