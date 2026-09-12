import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { GalleryImage } from '../../lib/types'

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await supabase.from('gallery_images').select('*').order('sort_order')
    setImages((data as GalleryImage[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    for (const file of Array.from(files)) {
      const path = `gallery/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { error: upErr } = await supabase.storage.from('aura-media').upload(path, file)
      if (upErr) {
        setError(upErr.message)
        continue
      }
      const { data } = supabase.storage.from('aura-media').getPublicUrl(path)
      await supabase.from('gallery_images').insert({ url: data.publicUrl, sort_order: images.length })
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  async function remove(img: GalleryImage) {
    if (!confirm('Remove this photo?')) return
    await supabase.from('gallery_images').delete().eq('id', img.id)
    load()
  }

  return (
    <div>
      <h1 className="display font-bold text-3xl mb-1">Gallery</h1>
      <p style={{ color: 'var(--muted)' }}>Photos shown on the public site.</p>

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onUpload} disabled={uploading} className="text-sm" />
        {uploading && <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Uploading…</p>}
        {error && <p className="text-sm mt-2" style={{ color: 'var(--red)' }}>{error}</p>}
      </div>

      <div className="mt-6">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : images.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: 'var(--line)' }}>
                <img src={img.url} alt={img.caption ?? ''} className="w-full aspect-square object-cover" />
                <button
                  onClick={() => remove(img)}
                  className="absolute top-1.5 right-1.5 text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--paper)' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
