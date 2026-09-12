import { NavLink, Outlet } from 'react-router-dom'
import { Logo } from './Logo'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/programs', label: 'Programs' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/results', label: 'Results' },
  { to: '/gallery', label: 'Gallery' },
]

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur border-b" style={{ borderColor: 'var(--line)', background: 'rgba(10,10,10,0.85)' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <NavLink to="/" className="shrink-0">
            <Logo />
          </NavLink>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'text-white' : 'text-[var(--muted)] hover:text-[var(--silver)]'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <MobileNav />
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t mt-20" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Art. Ideas. People. Culture. Beyond.</p>
        </div>
      </footer>
    </div>
  )
}

function MobileNav() {
  return (
    <nav className="md:hidden flex items-center gap-4 text-xs">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) => (isActive ? 'text-white' : 'text-[var(--muted)]')}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
