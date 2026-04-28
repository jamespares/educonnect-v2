import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, createContext, useContext } from 'react'
import { api } from './lib/api'
import LandingTeacher from './pages/LandingTeacher'
import LandingSchool from './pages/LandingSchool'
import Login from './pages/Login'
import Register from './pages/Register'
import TeacherDashboard from './pages/TeacherDashboard'
import SchoolDashboard from './pages/SchoolDashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Profile from './pages/Profile'

type User = { id: number; email: string; role: 'teacher' | 'school' | 'admin' } | null

interface AuthCtx {
  user: User
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} })

export const useAuth = () => useContext(AuthContext)

function Protected({ children, role }: { children: React.ReactNode; role?: 'teacher' | 'school' | 'admin' }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={`/${user.role}-dashboard`} replace />
  return <>{children}</>
}

function AutoRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (!user) return <Navigate to="/teachers" replace />
  return <Navigate to={user.role === 'school' ? '/school-dashboard' : '/teacher-dashboard'} replace />
}

export default function App() {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data: any = await api.auth.me()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await api.auth.logout()
    setUser(null)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      <Routes>
        <Route path="/" element={<AutoRedirect />} />
        <Route path="/teachers" element={<LandingTeacher />} />
        <Route path="/schools" element={<LandingSchool />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/teacher-dashboard" element={<Protected role="teacher"><TeacherDashboard /></Protected>} />
        <Route path="/school-dashboard" element={<Protected role="school"><SchoolDashboard /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
      </Routes>
    </AuthContext.Provider>
  )
}
