import { Link } from 'react-router-dom'

export default function LandingSchool() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">EduConnect</Link>
          <div className="flex items-center gap-4">
            <Link to="/teachers" className="text-sm text-gray-600 hover:text-gray-900">For Teachers</Link>
            <Link to="/login" className="text-sm font-medium text-gray-900 hover:text-brand-red">Log in</Link>
            <Link to="/register" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
              Post a Job
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="inline-block px-4 py-2 bg-brand-red/10 text-brand-red rounded-full text-sm font-semibold">
              For Schools
            </span>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
              Hire Exceptional Teachers for Your School
            </h1>
            <p className="text-xl text-gray-600 max-w-lg">
              Connect with qualified, vetted educators from around the world. Post jobs, review candidates, and manage your entire hiring pipeline in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                Start Hiring
              </Link>
              <Link to="/login" className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                School Login
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg">School Hero Placeholder</p>
              <p className="text-sm">Add your campus photos to <code>public/images/</code></p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Schools Choose EduConnect</h2>
            <p className="text-lg text-gray-600">Streamlined hiring for international schools across China</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Vetted Candidates', desc: 'Every teacher is pre-screened for qualifications, experience, and cultural fit before they can apply to your positions.' },
              { title: 'Smart Matching', desc: 'Our system suggests candidates based on subject specialty, experience level, and location preferences.' },
              { title: 'End-to-End Pipeline', desc: 'Track applicants from first contact to signed contract. Manage interviews, offers, and onboarding in one dashboard.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-xl border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your next great teacher?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Post your first job in minutes and start receiving applications from qualified candidates today.
          </p>
          <Link to="/register" className="inline-block px-8 py-4 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors">
            Create School Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2026 EduConnect. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/teachers" className="text-sm text-gray-500 hover:text-gray-900">Teachers</Link>
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
