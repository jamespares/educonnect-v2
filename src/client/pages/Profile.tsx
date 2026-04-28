import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { uploadFile } from '../lib/upload'
import { useAuth } from '../App'

export default function Profile() {
  const { user, logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    firstName: '', lastName: '', phone: '', nationality: '', yearsExperience: '',
    education: '', subjectSpecialty: '', preferredLocation: '', preferredAgeGroup: '',
    linkedin: '', bio: '', cvUrl: '', headshotUrl: '', videoUrl: '',
  })

  // School form state
  const [schoolForm, setSchoolForm] = useState({
    name: '', nameChinese: '', location: '', city: '', province: '',
    schoolType: '' as 'international' | 'bilingual' | 'public' | 'private' | '',
    description: '', website: '', contactName: '', contactEmail: '', contactPhone: '',
  })

  const [newJob, setNewJob] = useState({
    title: '', location: '', city: '', salary: '', experienceRequired: '',
    chineseRequired: false, description: '', requirements: '', benefits: '',
    subjects: '', ageGroups: '',
  })

  useEffect(() => {
    if (!user) return
    if (user.role === 'teacher') {
      api.teachers.getProfile().then((r: any) => {
        if (r.profile) setTeacherForm(r.profile)
      })
    } else {
      api.schools.getProfile().then((r: any) => {
        if (r.profile) setSchoolForm(r.profile)
      })
    }
  }, [user])

  const handleTeacherSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.teachers.saveProfile(teacherForm)
      setMessage('Profile saved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (type: 'cv' | 'headshot' | 'video', file: File | null) => {
    if (!file) return
    setUploading(prev => ({ ...prev, [type]: true }))
    try {
      const result = await uploadFile(file, type)
      setTeacherForm(prev => ({ ...prev, [`${type}Url`]: result.url }))
      setMessage(`${type} uploaded!`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleSchoolSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.schools.saveProfile(schoolForm)
      setMessage('Profile saved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.jobs.create(newJob)
      setMessage('Job posted!')
      setNewJob({
        title: '', location: '', city: '', salary: '', experienceRequired: '',
        chineseRequired: false, description: '', requirements: '', benefits: '',
        subjects: '', ageGroups: '',
      })
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message)
    }
  }

  if (!user) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">EduConnect</Link>
          <div className="flex items-center gap-4">
            <Link to={user.role === 'school' ? '/school-dashboard' : '/teacher-dashboard'} className="text-sm font-medium text-gray-900 hover:text-brand-red">
              Dashboard
            </Link>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user.role === 'teacher' ? 'Teacher Profile' : 'School Profile'}
        </h1>
        <p className="text-gray-600 mb-8">
          {user.role === 'teacher'
            ? 'Complete your profile so schools can discover you.'
            : 'Manage your school information and post new jobs.'}
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('saved') || message.includes('posted') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {user.role === 'teacher' ? (
          <form onSubmit={handleTeacherSave} className="bg-white rounded-xl border border-gray-100 p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input value={teacherForm.firstName} onChange={e => setTeacherForm({...teacherForm, firstName: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input value={teacherForm.lastName} onChange={e => setTeacherForm({...teacherForm, lastName: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={teacherForm.phone} onChange={e => setTeacherForm({...teacherForm, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input value={teacherForm.nationality} onChange={e => setTeacherForm({...teacherForm, nationality: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input value={teacherForm.yearsExperience} onChange={e => setTeacherForm({...teacherForm, yearsExperience: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="e.g. 5 years" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input value={teacherForm.education} onChange={e => setTeacherForm({...teacherForm, education: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="e.g. BA Education, PGCE" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Specialty</label>
                <input value={teacherForm.subjectSpecialty} onChange={e => setTeacherForm({...teacherForm, subjectSpecialty: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                <input value={teacherForm.preferredLocation} onChange={e => setTeacherForm({...teacherForm, preferredLocation: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="e.g. Shanghai, Beijing" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Age Group</label>
              <input value={teacherForm.preferredAgeGroup} onChange={e => setTeacherForm({...teacherForm, preferredAgeGroup: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="e.g. Primary, Middle School" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input value={teacherForm.linkedin} onChange={e => setTeacherForm({...teacherForm, linkedin: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea value={teacherForm.bio} onChange={e => setTeacherForm({...teacherForm, bio: e.target.value})} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="Tell schools about yourself..." />
            </div>

            {/* File Uploads */}
            <div className="border-t border-gray-100 pt-6 space-y-5">
              <h3 className="text-lg font-semibold text-gray-900">Files</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CV / Resume (PDF)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => handleFileUpload('cv', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {teacherForm.cvUrl && (
                  <a href={teacherForm.cvUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-red hover:underline mt-1 inline-block">
                    View current CV →
                  </a>
                )}
                {uploading.cv && <span className="text-sm text-gray-500 ml-2">Uploading...</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headshot</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload('headshot', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {teacherForm.headshotUrl && (
                  <a href={teacherForm.headshotUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-red hover:underline mt-1 inline-block">
                    View current headshot →
                  </a>
                )}
                {uploading.headshot && <span className="text-sm text-gray-500 ml-2">Uploading...</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Introduction Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => handleFileUpload('video', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {teacherForm.videoUrl && (
                  <a href={teacherForm.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-red hover:underline mt-1 inline-block">
                    View current video →
                  </a>
                )}
                {uploading.video && <span className="text-sm text-gray-500 ml-2">Uploading...</span>}
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleSchoolSave} className="bg-white rounded-xl border border-gray-100 p-8 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">School Information</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input value={schoolForm.name} onChange={e => setSchoolForm({...schoolForm, name: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (Chinese)</label>
                  <input value={schoolForm.nameChinese} onChange={e => setSchoolForm({...schoolForm, nameChinese: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={schoolForm.city} onChange={e => setSchoolForm({...schoolForm, city: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input value={schoolForm.province} onChange={e => setSchoolForm({...schoolForm, province: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                  <select value={schoolForm.schoolType} onChange={e => setSchoolForm({...schoolForm, schoolType: e.target.value as any})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white">
                    <option value="">Select...</option>
                    <option value="international">International</option>
                    <option value="bilingual">Bilingual</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={schoolForm.description} onChange={e => setSchoolForm({...schoolForm, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input value={schoolForm.website} onChange={e => setSchoolForm({...schoolForm, website: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input value={schoolForm.contactName} onChange={e => setSchoolForm({...schoolForm, contactName: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input value={schoolForm.contactEmail} onChange={e => setSchoolForm({...schoolForm, contactEmail: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input value={schoolForm.contactPhone} onChange={e => setSchoolForm({...schoolForm, contactPhone: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>

            <form onSubmit={handleCreateJob} className="bg-white rounded-xl border border-gray-100 p-8 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Post a New Job</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={newJob.city} onChange={e => setNewJob({...newJob, city: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="e.g. 25,000 - 35,000 RMB" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
                  <input value={newJob.experienceRequired} onChange={e => setNewJob({...newJob, experienceRequired: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="e.g. 2+ years" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="chinese" checked={newJob.chineseRequired} onChange={e => setNewJob({...newJob, chineseRequired: e.target.checked})} className="w-4 h-4" />
                  <label htmlFor="chinese" className="text-sm text-gray-700">Chinese required</label>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma-separated)</label>
                  <input value={newJob.subjects} onChange={e => setNewJob({...newJob, subjects: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="Math, Science, English" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Groups (comma-separated)</label>
                  <input value={newJob.ageGroups} onChange={e => setNewJob({...newJob, ageGroups: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" placeholder="Primary, Middle School" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                <textarea value={newJob.benefits} onChange={e => setNewJob({...newJob, benefits: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-brand-red text-white font-medium rounded-lg hover:bg-brand-red-dark transition-colors">
                Post Job
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
