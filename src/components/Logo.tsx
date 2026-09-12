export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const px = size === 'lg' ? 40 : size === 'md' ? 26 : 18
  return (
    <div className="flex items-center gap-2 select-none">
      <span
        className="display font-bold"
        style={{ fontSize: px, letterSpacing: '-0.02em', lineHeight: 1 }}
      >
        AURA
      </span>
      <span className="flex flex-col gap-[2px]" aria-hidden>
        <span className="chip" style={{ background: 'var(--red)' }} />
        <span className="chip" style={{ background: 'var(--yellow)' }} />
        <span className="chip" style={{ background: 'var(--blue)' }} />
      </span>
    </div>
  )
}
