import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Logo } from '../Logo'

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/teams', label: 'Teams' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/programs', label: 'Programs' },
  { to: '/admin/participants', label: 'Participants' },
  { to: '/admin/results', label: 'Results' },
  { to: '/admin/schedule', label: 'Schedule' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r" style={{ borderColor: 'var(--line)' }}>
        <div className="p-5">
          <Logo size="sm" />
        </div>
        <nav className="px-3 pb-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm whitespace-nowrap ${isActive ? 'font-medium' : ''}`
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--panel)' : 'transparent',
                color: isActive ? 'var(--paper)' : 'var(--muted)',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-5">
          <button onClick={signOut} className="text-sm px-3 py-2 rounded-lg w-full text-left" style={{ color: 'var(--muted)' }}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-5 md:p-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  )
}
