/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { Layout, Navbar } from '../components/Layout'
import { getCurrentUser, logout } from '../lib/auth'
import { createDb } from '../../db'
import { jobs, schoolProfiles } from '../../db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Landing — Teachers
app.get('/teachers', async (c) => {
  const user = await getCurrentUser(c)
  return c.html(
    <Layout title="Teachers" user={user}>
      <div class="min-h-screen bg-white">
        <Navbar user={user} active="teachers" />

        <section style="padding:6rem 0">
          <div class="max-w-7xl mx-auto px-6 grid" style="grid-template-columns:1fr 1fr;gap:4rem;align-items:center">
            <div class="space-y-8">
              <h1 style="font-size:3rem;font-weight:700;line-height:1.25;font-family:var(--font-heading)">
                <span class="block text-gray-900">Teach.</span>
                <span class="block text-gray-700 italic">Explore.</span>
                <span style="color:var(--accent)">Thrive.</span>
              </h1>
              <p style="font-size:1.25rem;color:var(--base-text-secondary);max-width:32rem">
                Globalise your career with a teaching job in China. We connect exceptional educators with premier international schools across Shanghai, Beijing, Shenzhen, and beyond.
              </p>
              <div class="flex flex-wrap" style="gap:1rem">
                <a href="/register" class="btn btn-dark" style="padding:'1rem 2rem'">Start Your Journey</a>
                <a href="/jobs" class="btn btn-secondary" style="padding:'1rem 2rem'">Browse Jobs</a>
              </div>
              <div class="flex" style="gap:2rem;padding-top:1rem">
                <div><div style="font-size:1.875rem;font-weight:700">25K+</div><div style="font-size:0.875rem;color:var(--base-text-secondary)">RMB Monthly</div></div>
                <div><div style="font-size:1.875rem;font-weight:700">278</div><div style="font-size:0.875rem;color:var(--base-text-secondary)">Open Positions</div></div>
                <div><div style="font-size:1.875rem;font-weight:700">Guaranteed</div><div style="font-size:0.875rem;color:var(--base-text-secondary)">Interview</div></div>
              </div>
            </div>
            <div class="hero-placeholder" style="height:400px">
              <div class="text-center" style="color:var(--base-text-muted)">
                <svg style="width:6rem;height:6rem;margin:0 auto 1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2z" /></svg>
                <p style="font-size:1.125rem">Hero Image Placeholder</p>
              </div>
            </div>
          </div>
        </section>

        <section style="padding:6rem 0;background:#f8fafc">
          <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-16">
              <h2 style="font-size:1.875rem;font-weight:700;margin-bottom:1rem;font-family:var(--font-heading)">How It Works</h2>
              <p style="font-size:1.125rem;color:var(--base-text-secondary)">Simple steps to your dream teaching job in China</p>
            </div>
            <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem">
              {[
                { step: '01', title: 'Create Your Profile', desc: 'Sign up and build your teacher profile in under 5 minutes. Add your experience, subjects, and preferred cities.' },
                { step: '02', title: 'Browse & Apply', desc: 'Explore 200+ verified jobs from top international schools. Apply with one click to positions that match your skills.' },
                { step: '03', title: 'Get Hired', desc: 'Schools review your application and reach out directly. We help with interview prep and relocation guidance.' },
              ].map((item) => (
                <div class="card p-8">
                  <div style="font-size:2.25rem;font-weight:700;color:var(--accent);opacity:0.2;margin-bottom:1rem">{item.step}</div>
                  <h3 style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;font-family:var(--font-heading)">{item.title}</h3>
                  <p style="color:var(--base-text-secondary);line-height:1.625">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style="padding:5rem 0;background:var(--accent);color:white">
          <div class="max-w-4xl mx-auto px-6 text-center">
            <h2 style="font-size:1.875rem;font-weight:700;margin-bottom:1.5rem;font-family:var(--font-heading)">Ready to start your adventure?</h2>
            <p style="font-size:1.25rem;color:rgba(255,255,255,0.9);margin-bottom:2rem">
              Join teachers who are transforming their careers by teaching in China.
            </p>
            <a href="/register" class="btn" style="padding:'1rem 2rem';background:white;color:var(--accent);font-weight:600">Create Free Account</a>
          </div>
        </section>

        <footer>
          <div class="max-w-7xl mx-auto px-6 flex flex-col" style="gap:1rem;align-items:center;justify-content:space-between">
            <p style="font-size:0.875rem;color:var(--base-text-muted)">© 2026 EduConnect. All rights reserved.</p>
            <div class="flex" style="gap:1.5rem">
              <a href="/schools" style="font-size:0.875rem;color:var(--base-text-muted);text-decoration:none">Schools</a>
              <a href="/jobs" style="font-size:0.875rem;color:var(--base-text-muted);text-decoration:none">Jobs</a>
              <a href="/login" style="font-size:0.875rem;color:var(--base-text-muted);text-decoration:none">Log in</a>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  )
})

// Landing — Schools
app.get('/schools', async (c) => {
  const user = await getCurrentUser(c)
  return c.html(
    <Layout title="Schools" user={user}>
      <div class="min-h-screen bg-white">
        <Navbar user={user} active="schools" />

        <section style="padding:6rem 0">
          <div class="max-w-7xl mx-auto px-6 grid" style="grid-template-columns:1fr 1fr;gap:4rem;align-items:center">
            <div class="space-y-8">
              <h1 style="font-size:3rem;font-weight:700;line-height:1.25;font-family:var(--font-heading)">
                <span class="block text-gray-900">Hire.</span>
                <span class="block text-gray-700 italic">The Best.</span>
                <span style="color:var(--accent)">Teachers.</span>
              </h1>
              <p style="font-size:1.25rem;color:var(--base-text-secondary);max-width:32rem">
                Access a global pool of qualified educators. Post jobs, review applications, and hire directly — all in one platform.
              </p>
              <div class="flex flex-wrap" style="gap:1rem">
                <a href="/register" class="btn btn-dark" style="padding:'1rem 2rem'">Post a Job</a>
                <a href="/jobs" class="btn btn-secondary" style="padding:'1rem 2rem'">Browse Talent</a>
              </div>
            </div>
            <div class="hero-placeholder" style="height:400px">
              <div class="text-center" style="color:var(--base-text-muted)">
                <svg style="width:6rem;height:6rem;margin:0 auto 1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <p style="font-size:1.125rem">School Portal Preview</p>
              </div>
            </div>
          </div>
        </section>

        <section style="padding:6rem 0;background:#f8fafc">
          <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-16">
              <h2 style="font-size:1.875rem;font-weight:700;margin-bottom:1rem;font-family:var(--font-heading)">Why Schools Choose EduConnect</h2>
              <p style="font-size:1.125rem;color:var(--base-text-secondary)">Streamlined hiring for international and bilingual schools</p>
            </div>
            <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem">
              {[
                { step: '01', title: 'Post Your Job', desc: 'Create a detailed job posting in minutes. Specify subjects, experience requirements, and benefits.' },
                { step: '02', title: 'Review Applicants', desc: 'Browse teacher profiles with verified credentials, CVs, and video introductions.' },
                { step: '03', title: 'Hire Directly', desc: 'Contact candidates, schedule interviews, and extend offers — all within the platform.' },
              ].map((item) => (
                <div class="card p-8">
                  <div style="font-size:2.25rem;font-weight:700;color:var(--accent);opacity:0.2;margin-bottom:1rem">{item.step}</div>
                  <h3 style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;font-family:var(--font-heading)">{item.title}</h3>
                  <p style="color:var(--base-text-secondary);line-height:1.625">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer>
          <div class="max-w-7xl mx-auto px-6 flex flex-col" style="gap:1rem;align-items:center;justify-content:space-between">
            <p style="font-size:0.875rem;color:var(--base-text-muted)">© 2026 EduConnect. All rights reserved.</p>
            <div class="flex" style="gap:1.5rem">
              <a href="/teachers" style="font-size:0.875rem;color:var(--base-text-muted);text-decoration:none">Teachers</a>
              <a href="/jobs" style="font-size:0.875rem;color:var(--base-text-muted);text-decoration:none">Jobs</a>
              <a href="/login" style="font-size:0.875rem;color:var(--base-text-muted);text-decoration:none">Log in</a>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  )
})

// Login
app.get('/login', async (c) => {
  const user = await getCurrentUser(c)
  if (user) return c.redirect(`/${user.role}-dashboard`)

  return c.html(
    <Layout title="Sign In">
      <div class="min-h-screen flex items-center justify-center px-6" style="background:var(--base-bg)">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <a href="/" style="font-size:1.5rem;font-weight:700;color:var(--base-text);text-decoration:none;font-family:var(--font-heading)">EduConnect</a>
            <h1 style="margin-top:1.5rem;font-size:1.5rem;font-weight:700">Welcome back</h1>
            <p style="margin-top:0.5rem;color:var(--base-text-secondary)">Log in to your account</p>
          </div>

          <div class="card p-8">
            <form id="login-form" class="space-y-5">
              <div>
                <label style="display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.25rem">Email</label>
                <input type="email" id="email" class="input" placeholder="you@example.com" required />
              </div>
              <div>
                <label style="display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.25rem">Password</label>
                <input type="password" id="password" class="input" placeholder="••••••••" required />
              </div>
              <div id="error" class="hidden error-text"></div>
              <button type="submit" id="submit" class="btn btn-dark btn-full">Sign In</button>
            </form>

            <p style="margin-top:1.5rem;text-align:center;font-size:0.875rem;color:var(--base-text-secondary)">
              Don't have an account? <a href="/register" style="font-weight:500;color:var(--accent);text-decoration:none">Sign up</a>
            </p>
          </div>
        </div>
      </div>

      <script type="module" dangerouslySetInnerHTML={{
        __html: `
          import { createAuthClient } from "https://esm.sh/better-auth@1.1.1/client";
          const client = createAuthClient({ baseURL: window.location.origin });

          document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const err = document.getElementById('error');
            const btn = document.getElementById('submit');
            err.classList.add('hidden');
            btn.disabled = true;
            btn.textContent = 'Signing in...';

            const { data, error } = await client.signIn.email({
              email: document.getElementById('email').value,
              password: document.getElementById('password').value,
            });

            if (error) {
              err.textContent = error.message || 'Invalid credentials';
              err.classList.remove('hidden');
              btn.disabled = false;
              btn.textContent = 'Sign In';
            } else {
              window.location.href = '/';
            }
          });
        `
      }} />
    </Layout>
  )
})

// Register
app.get('/register', async (c) => {
  const user = await getCurrentUser(c)
  if (user) return c.redirect(`/${user.role}-dashboard`)

  return c.html(
    <Layout title="Sign Up">
      <div class="min-h-screen flex items-center justify-center px-6" style="background:var(--base-bg)">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <a href="/" style="font-size:1.5rem;font-weight:700;color:var(--base-text);text-decoration:none;font-family:var(--font-heading)">EduConnect</a>
            <h1 style="margin-top:1.5rem;font-size:1.5rem;font-weight:700">Create your account</h1>
            <p style="margin-top:0.5rem;color:var(--base-text-secondary)">Join EduConnect in under a minute</p>
          </div>

          <div class="card p-8">
            <form id="register-form" class="space-y-5">
              <div>
                <label style="display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.25rem">I am a...</label>
                <div class="flex rounded-lg" style="background:#f8fafc;padding:0.25rem">
                  <button type="button" id="role-teacher" class="flex-1 py-2 text-sm font-medium rounded-md" style="background:white;color:var(--base-text);box-shadow:var(--shadow)">Teacher</button>
                  <button type="button" id="role-school" class="flex-1 py-2 text-sm font-medium rounded-md" style="color:var(--base-text-muted)">School</button>
                </div>
                <input type="hidden" id="role" value="teacher" />
              </div>
              <div>
                <label style="display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.25rem">Email</label>
                <input type="email" id="email" class="input" placeholder="you@example.com" required />
              </div>
              <div>
                <label style="display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.25rem">Password</label>
                <input type="password" id="password" class="input" placeholder="Min. 8 characters" required minlength={8} />
              </div>
              <div id="error" class="hidden error-text"></div>
              <button type="submit" id="submit" class="btn btn-dark btn-full">Create Account</button>
            </form>

            <p style="margin-top:1.5rem;text-align:center;font-size:0.875rem;color:var(--base-text-secondary)">
              Already have an account? <a href="/login" style="font-weight:500;color:var(--accent);text-decoration:none">Log in</a>
            </p>
          </div>
        </div>
      </div>

      <script type="module" dangerouslySetInnerHTML={{
        __html: `
          import { createAuthClient } from "https://esm.sh/better-auth@1.1.1/client";
          const client = createAuthClient({ baseURL: window.location.origin });

          const roleTeacher = document.getElementById('role-teacher');
          const roleSchool = document.getElementById('role-school');
          const roleInput = document.getElementById('role');

          roleTeacher.addEventListener('click', () => {
            roleInput.value = 'teacher';
            roleTeacher.style.cssText = 'background:white;color:var(--base-text);box-shadow:var(--shadow)';
            roleSchool.style.cssText = 'color:var(--base-text-muted)';
          });
          roleSchool.addEventListener('click', () => {
            roleInput.value = 'school';
            roleSchool.style.cssText = 'background:white;color:var(--base-text);box-shadow:var(--shadow)';
            roleTeacher.style.cssText = 'color:var(--base-text-muted)';
          });

          document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const err = document.getElementById('error');
            const btn = document.getElementById('submit');
            err.classList.add('hidden');
            btn.disabled = true;
            btn.textContent = 'Creating account...';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            // Step 1: Better Auth sign up
            const { data: signUpData, error: signUpError } = await client.signUp.email({ email, password });
            if (signUpError) {
              err.textContent = signUpError.message || 'Registration failed';
              err.classList.remove('hidden');
              btn.disabled = false;
              btn.textContent = 'Create Account';
              return;
            }

            // Step 2: Set role via API
            try {
              const res = await fetch('/api/auth/set-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
              });
              if (!res.ok) throw new Error('Failed to set role');
            } catch (e) {
              err.textContent = 'Account created but role setup failed. Please contact support.';
              err.classList.remove('hidden');
              btn.disabled = false;
              btn.textContent = 'Create Account';
              return;
            }

            window.location.href = '/profile';
          });
        `
      }} />
    </Layout>
  )
})

// Logout
app.get('/logout', async (c) => {
  await logout(c)
  return c.redirect('/')
})

// Jobs listing
app.get('/jobs', async (c) => {
  const user = await getCurrentUser(c)
  const db = createDb(c.env.DB)
  const allJobs = await db.select().from(jobs).where(eq(jobs.isActive, true)).all()

  return c.html(
    <Layout title="Browse Jobs" user={user}>
      <Navbar user={user} active="jobs" />
      <div style="padding:3rem 0">
        <div class="max-w-7xl mx-auto px-6">
          <h1 style="font-size:2rem;font-weight:700;margin-bottom:2rem;font-family:var(--font-heading)">Open Positions</h1>
          {allJobs.length === 0 ? (
            <p style="color:var(--base-text-secondary)">No open positions right now. Check back soon!</p>
          ) : (
            <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem">
              {allJobs.map((job) => (
                <a href={`/jobs/${job.id}`} class="card" style="padding:1.5rem;text-decoration:none;display:block;transition:all 0.2s">
                  <h3 style="font-size:1.125rem;font-weight:600;margin-bottom:0.5rem;font-family:var(--font-heading)">{job.title}</h3>
                  <p style="font-size:0.875rem;color:var(--base-text-secondary);margin-bottom:0.5rem">{job.company || 'Unknown school'} — {job.location || job.city}</p>
                  <div class="flex flex-wrap" style="gap:0.5rem">
                    {job.salary && <span style="font-size:0.75rem;padding:0.25rem 0.5rem;background:var(--accent-bg);color:var(--accent);border-radius:4px;font-weight:500">{job.salary}</span>}
                    {job.subjects && <span style="font-size:0.75rem;padding:0.25rem 0.5rem;background:#f3f4f6;color:var(--base-text-secondary);border-radius:4px">{job.subjects}</span>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
})

// Job detail
app.get('/jobs/:id', async (c) => {
  const user = await getCurrentUser(c)
  const id = parseInt(c.req.param('id'))
  if (isNaN(id)) return c.notFound()

  const db = createDb(c.env.DB)
  const job = await db.select().from(jobs).where(eq(jobs.id, id)).get()
  if (!job) return c.notFound()

  const school = job.schoolId
    ? await db.select().from(schoolProfiles).where(eq(schoolProfiles.id, job.schoolId)).get()
    : null

  return c.html(
    <Layout title={job.title} user={user}>
      <Navbar user={user} active="jobs" />
      <div style="padding:3rem 0">
        <div class="max-w-4xl mx-auto px-6">
          <a href="/jobs" style="font-size:0.875rem;color:var(--base-text-secondary);text-decoration:none;margin-bottom:1rem;display:block">← Back to jobs</a>
          <div class="card p-8">
            <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;font-family:var(--font-heading)">{job.title}</h1>
            <p style="color:var(--base-text-secondary);margin-bottom:1.5rem">{job.company || school?.name || 'Unknown'} — {job.location || job.city}</p>

            <div class="flex flex-wrap" style="gap:0.5rem;margin-bottom:1.5rem">
              {job.salary && <span style="font-size:0.875rem;padding:0.375rem 0.75rem;background:var(--accent-bg);color:var(--accent);border-radius:4px;font-weight:500">{job.salary}</span>}
              {job.experienceRequired && <span style="font-size:0.875rem;padding:0.375rem 0.75rem;background:#f3f4f6;border-radius:4px">{job.experienceRequired}</span>}
              {job.chineseRequired && <span style="font-size:0.875rem;padding:0.375rem 0.75rem;background:#f3f4f6;border-radius:4px">Chinese required</span>}
            </div>

            {job.description && (
              <div style="margin-bottom:1.5rem">
                <h3 style="font-size:1rem;font-weight:600;margin-bottom:0.5rem">Description</h3>
                <p style="color:var(--base-text-secondary);white-space:pre-wrap">{job.description}</p>
              </div>
            )}
            {job.requirements && (
              <div style="margin-bottom:1.5rem">
                <h3 style="font-size:1rem;font-weight:600;margin-bottom:0.5rem">Requirements</h3>
                <p style="color:var(--base-text-secondary);white-space:pre-wrap">{job.requirements}</p>
              </div>
            )}
            {job.benefits && (
              <div style="margin-bottom:1.5rem">
                <h3 style="font-size:1rem;font-weight:600;margin-bottom:0.5rem">Benefits</h3>
                <p style="color:var(--base-text-secondary);white-space:pre-wrap">{job.benefits}</p>
              </div>
            )}

            {user?.role === 'teacher' && (
              <form method="post" action={`/api/applications`}>
                <input type="hidden" name="jobId" value={String(job.id)} />
                <button type="submit" class="btn btn-primary">Apply Now</button>
              </form>
            )}
            {!user && (
              <a href="/login" class="btn btn-primary">Log in to apply</a>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
})

export default app
