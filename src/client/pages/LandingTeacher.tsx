import { Link } from 'react-router-dom'

export default function LandingTeacher() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">EduConnect</Link>
          <div className="flex items-center gap-4">
            <Link to="/schools" className="text-sm text-gray-600 hover:text-gray-900">For Schools</Link>
            <Link to="/jobs" className="text-sm text-gray-600 hover:text-gray-900">Browse Jobs</Link>
            <Link to="/login" className="text-sm font-medium text-gray-900 hover:text-brand-red">Log in</Link>
            <Link to="/register" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="block text-gray-900">Teach.</span>
              <span className="block text-gray-700 italic">Explore.</span>
              <span className="block text-brand-red">Thrive.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg">
              Globalise your career with a teaching job in China. We connect exceptional educators with premier international schools across Shanghai, Beijing, Shenzhen, and beyond.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                Start Your Journey
              </Link>
              <Link to="/jobs" className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                Browse Jobs
              </Link>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">25K+</div>
                <div className="text-sm text-gray-600">RMB Monthly</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">278</div>
                <div className="text-sm text-gray-600">Open Positions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">Guaranteed</div>
                <div className="text-sm text-gray-600">Interview</div>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">Hero Image Placeholder</p>
              <p className="text-sm">Add your classroom/China photos to <code>public/images/</code></p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to your dream teaching job in China</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up and build your teacher profile in under 5 minutes. Add your experience, subjects, and preferred cities.' },
              { step: '02', title: 'Browse & Apply', desc: 'Explore 200+ verified jobs from top international schools. Apply with one click to positions that match your skills.' },
              { step: '03', title: 'Get Hired', desc: 'Schools review your application and reach out directly. We help with interview prep and relocation guidance.' },
            ].map((item) => (
              <div key={item.step} className="bg-white p-8 rounded-xl border border-gray-100">
                <div className="text-4xl font-bold text-brand-red/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-red text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your adventure?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join teachers who are transforming their careers by teaching in China.
          </p>
          <Link to="/register" className="inline-block px-8 py-4 bg-white text-brand-red font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2026 EduConnect. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/schools" className="text-sm text-gray-500 hover:text-gray-900">Schools</Link>
            <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-900">Jobs</Link>
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
