import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../App'
import type { TeacherProfile, Application } from '../../db/schema'

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.teachers.getProfile().then((r: any) => setProfile(r.profile)),
      api.applications.myApplications().then((r: any) => setApplications(r.applications)),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>

  const profileComplete = profile && profile.firstName && profile.subjectSpecialty && profile.preferredLocation

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">EduConnect</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Link to="/profile" className="text-sm font-medium text-gray-900 hover:text-brand-red">Profile</Link>
            <Link to="/jobs" className="text-sm font-medium text-gray-900 hover:text-brand-red">Browse Jobs</Link>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your profile and track your applications</p>

        {!profileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Complete your profile</h3>
                <p className="text-amber-800 mt-1">Schools can't see you until you add your teaching subjects, experience, and preferred location.</p>
                <Link to="/profile" className="inline-block mt-3 text-sm font-medium text-amber-900 underline hover:no-underline">
                  Complete Profile →
                </Link>
              </div>
            </div>
          </div>
        )}

        {profile && !profile.hasPaid && (
          <div className="bg-brand-red/5 border border-brand-red/20 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-brand-red">Unlock full access</h3>
                <p className="text-brand-red/80 mt-1">Get guaranteed interviews, full job details, and direct school contact. One-time fee of $99.</p>
                <button
                  onClick={async () => {
                    try {
                      const data = await api.payments.createCheckout()
                      if (data.url) window.location.href = data.url
                    } catch (err: any) {
                      alert(err.message)
                    }
                  }}
                  className="inline-block mt-3 px-4 py-2 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-brand-red-dark transition-colors"
                >
                  Pay & Unlock →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-600 mt-1">Applications Sent</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">
              {applications.filter((a: any) => a.status === 'interview_scheduled').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Interviews</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">
              {profile?.hasPaid ? 'Active' : 'Free'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Account Status</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
            <Link to="/jobs" className="text-sm font-medium text-brand-red hover:underline">Browse More Jobs</Link>
          </div>
          {applications.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <p className="mb-2">You haven't applied to any jobs yet.</p>
              <Link to="/jobs" className="text-brand-red font-medium hover:underline">Browse open positions</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app: any) => (
                <div key={app.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-gray-900">{app.jobTitle}</p>
                    <p className="text-sm text-gray-500">{app.schoolName} · {app.jobCity}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    app.status === 'placed' ? 'bg-green-100 text-green-700' :
                    app.status === 'interview_scheduled' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'declined' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
