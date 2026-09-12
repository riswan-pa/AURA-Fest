import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { SiteLayout } from './components/SiteLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

import Home from './pages/Home'
import Programs from './pages/Programs'
import Schedule from './pages/Schedule'
import Results from './pages/Results'
import Gallery from './pages/Gallery'

import Login from './pages/admin/Login'
import Overview from './pages/admin/Overview'
import Teams from './pages/admin/Teams'
import Students from './pages/admin/Students'
import AdminPrograms from './pages/admin/AdminPrograms'
import Participants from './pages/admin/Participants'
import AdminResults from './pages/admin/AdminResults'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminGallery from './pages/admin/AdminGallery'
import Settings from './pages/admin/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/results" element={<Results />} />
            <Route path="/gallery" element={<Gallery />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="teams" element={<Teams />} />
            <Route path="students" element={<Students />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="participants" element={<Participants />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
