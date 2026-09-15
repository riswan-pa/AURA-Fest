import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GalleryImage } from '../lib/types'
import { EmptyState } from './Programs'

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        setImages((data as GalleryImage[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
      <h1 className="display font-bold text-4xl md:text-5xl fade-up">Gallery</h1>
      <p className="mt-3 fade-up" style={{ color: 'var(--muted)', animationDelay: '0.05s' }}>Moments from rehearsals and the stage. Tap a photo to preview or download it.</p>

      <div className="mt-10">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : images.length === 0 ? (
          <EmptyState message="Photos will show up here once they're added." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setOpenIndex(i)}
                className="hover-lift rounded-xl overflow-hidden border block text-left"
                style={{ borderColor: 'var(--line)' }}
              >
                <img src={img.url} alt={img.caption ?? ''} className="hover-scale w-full h-full object-cover aspect-square" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {openIndex !== null && images[openIndex] && (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </div>
  )
}

function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[]
  index: number
  onClose: () => void
  onNavigate: (i: number) => void
}) {
  const img = images[index]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length)
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, images.length, onClose, onNavigate])

  const [downloading, setDownloading] = useState(false)

  function downloadName(url: string) {
    const base = url.split('/').pop() || 'photo.jpg'
    return base.split('?')[0]
  }

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    setDownloading(true)
    try {
      const res = await fetch(img.url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = downloadName(img.url)
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(img.url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="text-sm px-4 py-2 rounded-full font-medium disabled:opacity-60"
          style={{ background: 'var(--paper)', color: 'var(--ink)' }}
        >
          {downloading ? 'Downloading…' : 'Download'}
        </button>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-sm px-4 py-2 rounded-full border"
          style={{ borderColor: 'var(--line)', color: 'var(--paper)' }}
        >
          Close
        </button>
      </div>

      <img
        src={img.url}
        alt={img.caption ?? ''}
        className="max-h-[80vh] max-w-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {img.caption && (
        <p className="mt-4 text-sm text-center max-w-lg" style={{ color: 'var(--silver)' }}>{img.caption}</p>
      )}

      {images.length > 1 && (
        <div className="mt-6 flex items-center gap-6">
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate((index - 1 + images.length) % images.length) }}
            className="text-sm px-4 py-2 rounded-full border"
            style={{ borderColor: 'var(--line)', color: 'var(--paper)' }}
          >
            ← Prev
          </button>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>{index + 1} / {images.length}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate((index + 1) % images.length) }}
            className="text-sm px-4 py-2 rounded-full border"
            style={{ borderColor: 'var(--line)', color: 'var(--paper)' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
