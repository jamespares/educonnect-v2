import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../App'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    if (!id) return
    api.jobs.get(Number(id))
      .then((r: any) => setJob(r.job))
      .catch(() => setJob(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'teacher') {
      alert('Only teachers can apply to jobs')
      return
    }
    setApplying(true)
    try {
      await api.applications.apply(Number(id))
      setApplied(true)
    } catch (err: any) {
      alert(err.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  if (!job) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-4">Job not found</p>
        <Link to="/jobs" className="text-brand-red font-medium hover:underline">← Back to jobs</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">EduConnect</Link>
          <div className="flex items-center gap-4">
            <Link to="/jobs" className="text-sm text-gray-600 hover:text-gray-900">All Jobs</Link>
            {user ? (
              <Link to={user.role === 'school' ? '/school-dashboard' : '/teacher-dashboard'} className="text-sm font-medium text-gray-900">Dashboard</Link>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-900">Log in</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block">← Back to jobs</Link>

        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-lg text-gray-600">{job.schoolName}</p>
            </div>
            <span className="px-3 py-1 bg-brand-red/10 text-brand-red text-sm font-semibold rounded-full">
              {job.schoolType || 'International School'}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {job.city && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                <p className="font-medium text-gray-900">{job.city}</p>
              </div>
            )}
            {job.salary && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Salary</p>
                <p className="font-medium text-gray-900">{job.salary}</p>
              </div>
            )}
            {job.experienceRequired && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
                <p className="font-medium text-gray-900">{job.experienceRequired}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {job.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Role</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            )}
            {job.requirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
              </div>
            )}
            {job.benefits && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.benefits}</p>
              </div>
            )}
            {job.subjects && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {job.subjects.split(',').map((s: string) => (
                    <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {job.ageGroups && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Age Groups</h3>
                <div className="flex flex-wrap gap-2">
                  {job.ageGroups.split(',').map((a: string) => (
                    <span key={a} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">{a.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
            <div>
              {job.schoolWebsite && (
                <a href={job.schoolWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-red hover:underline">
                  Visit school website →
                </a>
              )}
            </div>
            {applied ? (
              <span className="px-8 py-3 bg-green-100 text-green-700 font-medium rounded-lg">Applied ✓</span>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {applying ? 'Applying...' : user?.role === 'teacher' ? 'Apply Now' : 'Log in to Apply'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
