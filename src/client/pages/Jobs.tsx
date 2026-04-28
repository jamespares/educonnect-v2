import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [city, setCity] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const data: any = await api.jobs.list({ city, subject })
      setJobs(data.jobs)
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">EduConnect</Link>
          <div className="flex items-center gap-4">
            <Link to="/teachers" className="text-sm text-gray-600 hover:text-gray-900">For Teachers</Link>
            <Link to="/schools" className="text-sm text-gray-600 hover:text-gray-900">For Schools</Link>
            <Link to="/login" className="text-sm font-medium text-gray-900 hover:text-brand-red">Log in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teaching Jobs in China</h1>
          <p className="text-gray-600">Browse {jobs.length}+ open positions at international schools</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border border-gray-100 mb-8 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="City (e.g. Shanghai)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
          />
          <input
            type="text"
            placeholder="Subject (e.g. Math)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
          />
          <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No jobs found</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job: any) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 bg-brand-red/10 text-brand-red text-xs font-semibold rounded-full capitalize">
                    {job.schoolType || 'School'}
                  </span>
                  {job.isNew && <span className="text-xs text-gray-400">New</span>}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{job.company || job.schoolName || 'School'}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.city && <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{job.city}</span>}
                  {job.subjects && job.subjects.split(',').map((s: string) => (
                    <span key={s} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{s.trim()}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 font-medium">{job.salary || 'Salary negotiable'}</span>
                  <span className="text-brand-red font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
