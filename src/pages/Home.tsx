import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { GalleryImage, SiteSettings } from '../lib/types'

const navCards = [
  { to: '/programs', title: 'Programs', desc: 'Every item our college is entering, by category.', color: 'var(--red)' },
  { to: '/schedule', title: 'Schedule', desc: 'Where and when each program takes place.', color: 'var(--yellow)' },
  { to: '/results', title: 'Results', desc: 'Winners and grades as they are announced.', color: 'var(--blue)' },
]

const MARQUEE_TEXT = 'AURA · ARTS FEST 2K26 · ART · IDEAS · PEOPLE · CULTURE · BEYOND · '

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [photos, setPhotos] = useState<GalleryImage[]>([])
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => setSettings(data as SiteSettings))
    supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order')
      .limit(8)
      .then(({ data }) => setPhotos((data as GalleryImage[]) ?? []))
  }, [])

  useEffect(() => {
    if (photos.length < 2) return
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % photos.length), 5000)
    return () => clearInterval(t)
  }, [photos.length])

  const heroPhoto = photos[heroIndex]

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ minHeight: '78vh' }}>
        {heroPhoto ? (
          <>
            <div className="absolute inset-0">
              <img
                key={heroPhoto.id}
                src={heroPhoto.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover hero-slide"
              />
            </div>
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.96) 100%)' }}
            />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 100% at 20% 0%, #1a1a1c 0%, #0a0a0a 60%)' }} />
        )}

        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-20 md:pt-32 pb-16 flex flex-col" style={{ minHeight: '78vh' }}>
          <div className="flex items-center gap-2 mb-6 fade-up" aria-hidden>
            <span className="chip" style={{ background: 'var(--red)', width: 26, height: 7 }} />
            <span className="chip" style={{ background: 'var(--yellow)', width: 26, height: 7 }} />
            <span className="chip" style={{ background: 'var(--blue)', width: 26, height: 7 }} />
          </div>
          <h1
            className="display font-bold leading-[0.92] fade-up"
            style={{ fontSize: 'clamp(3.2rem, 11vw, 9rem)', animationDelay: '0.05s' }}
          >
            {settings?.fest_title ?? 'AURA'}
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl fade-up" style={{ color: 'var(--silver)', animationDelay: '0.15s' }}>
            {settings?.tagline ?? 'Art. Ideas. People. Culture. Beyond.'}
          </p>

          <div className="mt-9 flex flex-wrap gap-3 fade-up" style={{ animationDelay: '0.25s' }}>
            <Link
              to="/programs"
              className="hover-scale px-6 py-3.5 text-sm font-semibold rounded-full"
              style={{ background: 'var(--paper)', color: 'var(--ink)' }}
            >
              View programs
            </Link>
            <Link
              to="/gallery"
              className="hover-scale px-6 py-3.5 text-sm font-semibold rounded-full border-2"
              style={{ borderColor: 'var(--paper)' }}
            >
              See the gallery
            </Link>
          </div>

          <div className="mt-auto pt-16" />
        </div>

        {/* marquee strip pinned to hero bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 overflow-hidden border-t"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(10,10,10,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div className="marquee-track py-3">
            {[0, 1].map((rep) => (
              <span key={rep} className="flex items-center shrink-0">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="display font-semibold text-sm md:text-base tracking-wide px-4" style={{ color: 'var(--muted)' }}>
                    {MARQUEE_TEXT}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* NAV CARDS */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {navCards.map((c, i) => (
            <Link
              key={c.to}
              to={c.to}
              className="hover-lift group p-5 rounded-2xl border flex flex-col justify-between min-h-[160px] fade-up"
              style={{ borderColor: 'var(--line)', background: 'var(--panel)', animationDelay: `${i * 0.08}s` }}
            >
              <span className="chip rounded-full" style={{ background: c.color, width: 12, height: 12 }} />
              <div>
                <h3 className="display font-semibold text-xl mt-6 group-hover:text-white">{c.title}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{c.desc}</p>
              </div>
            </Link>
          ))}

          {/* Gallery card with live photo preview */}
          <Link
            to="/gallery"
            className="hover-lift group relative rounded-2xl border overflow-hidden flex flex-col justify-end min-h-[160px] fade-up"
            style={{ borderColor: 'var(--line)', animationDelay: '0.24s' }}
          >
            {photos.length > 0 ? (
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[2px]">
                {Array.from({ length: 4 }).map((_, i) => {
                  const p = photos[i % photos.length]
                  return p ? (
                    <img key={i} src={p.url} alt="" className="w-full h-full object-cover hover-scale" />
                  ) : (
                    <div key={i} style={{ background: 'var(--panel)' }} />
                  )
                })}
              </div>
            ) : (
              <div className="absolute inset-0" style={{ background: 'var(--panel)' }} />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.05) 40%, rgba(10,10,10,0.88) 100%)' }} />
            <div className="relative p-5">
              <span className="chip rounded-full" style={{ background: '#7c5cff', width: 12, height: 12 }} />
              <h3 className="display font-semibold text-xl mt-3 text-white">Gallery</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--silver)' }}>Moments from rehearsals and the stage.</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-24">
        <p className="text-sm max-w-xl fade-up" style={{ color: 'var(--muted)' }}>
          Tracking our college's entries across programs, teams and categories — Sub Junior through Super Senior.
        </p>
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
