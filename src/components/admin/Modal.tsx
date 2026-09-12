import type { ReactNode } from 'react'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--ink-2)', borderColor: 'var(--line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="display font-semibold text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none" style={{ color: 'var(--muted)' }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1.5" style={{ color: 'var(--silver)' }}>{label}</label>
      {children}
    </div>
  )
}

export const inputClass = 'w-full px-3.5 py-2 rounded-lg bg-transparent border outline-none text-sm'
export const inputStyle = { borderColor: 'var(--line)' }
