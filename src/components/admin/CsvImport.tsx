import { useRef, useState } from 'react'
import Papa from 'papaparse'

export function CsvImport({
  label,
  columns,
  onRows,
}: {
  label: string
  columns: string[]
  onRows: (rows: Record<string, string>[]) => Promise<{ ok: number; failed: number; errors: string[] }>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setStatus(null)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const res = await onRows(results.data)
        setBusy(false)
        setStatus(`Imported ${res.ok}${res.failed ? `, ${res.failed} failed` : ''}.${res.errors.length ? ' ' + res.errors.slice(0, 3).join(' ') : ''}`)
        if (fileRef.current) fileRef.current.value = ''
      },
      error: (err) => {
        setBusy(false)
        setStatus(`Could not read file: ${err.message}`)
      },
    })
  }

  return (
    <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
        CSV columns: {columns.join(', ')}
      </p>
      <input ref={fileRef} type="file" accept=".csv" onChange={onFile} disabled={busy} className="text-sm" />
      {status && <p className="text-sm mt-2" style={{ color: 'var(--silver)' }}>{status}</p>}
    </div>
  )
}
