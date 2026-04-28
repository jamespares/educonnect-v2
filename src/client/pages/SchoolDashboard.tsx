import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../App'
import type { SchoolProfile } from '../../db/schema'

export default function SchoolDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<SchoolProfile | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.schools.getProfile().then((r: any) => setProfile(r.profile)),
      api.applications.forSchool().then((r: any) => setApplications(r.applications)),
      api.jobs.list().then((r: any) => setJobs(r.jobs.filter((j: any) => j.schoolName === profile?.name))),
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [profile?.name])

  const handleStatusChange = async (id: number, status: string) => {
    await api.applications.updateStatus(id, { status })
    const refreshed: any = await api.applications.forSchool()
    setApplications(refreshed.applications)
  }

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">EduConnect</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Link to="/profile" className="text-sm font-medium text-gray-900 hover:text-brand-red">Profile</Link>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">School Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your school profile, job postings, and applicants</p>

        {!profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Complete your school profile</h3>
                <p className="text-amber-800 mt-1">Add your school name, location, and description before posting jobs.</p>
                <Link to="/profile" className="inline-block mt-3 text-sm font-medium text-amber-900 underline hover:no-underline">
                  Complete Profile →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">{jobs.length}</div>
            <div className="text-sm text-gray-600 mt-1">Active Jobs</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Applicants</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">
              {applications.filter(a => a.status === 'interview_scheduled').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Interviews Scheduled</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Applicants */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applicants</h2>
            </div>
            {applications.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <p>No applications yet. Post a job to start receiving candidates.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-auto">
                {applications.slice(0, 20).map((app: any) => (
                  <div key={app.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {app.teacherFirstName} {app.teacherLastName}
                      </p>
                      <span className="text-xs text-gray-500">{app.jobTitle}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {app.teacherSubject} · {app.teacherLocation}
                    </p>
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="interview_scheduled">Interview</option>
                        <option value="offer_extended">Offer</option>
                        <option value="placed">Placed</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jobs */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Jobs</h2>
              <Link to="/profile" className="text-sm font-medium text-brand-red hover:underline">+ Post New</Link>
            </div>
            {jobs.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <p className="mb-2">No jobs posted yet.</p>
                <p className="text-sm">Use your profile page to create your first job listing.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {jobs.map((job: any) => (
                  <div key={job.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.city} · {job.subjects}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
