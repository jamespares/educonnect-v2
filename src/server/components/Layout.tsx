/** @jsxImportSource hono/jsx */
import type { FC, PropsWithChildren } from 'hono/jsx'

export type AppUser = {
  id: number
  email: string
  role: 'teacher' | 'school' | 'admin'
}

export const Layout: FC<PropsWithChildren<{ title?: string; user?: AppUser | null }>> = ({
  children,
  title,
  user,
}) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title ? `${title} — EduConnect` : 'EduConnect'}</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      {children}
    </body>
  </html>
)

export const Navbar: FC<{ user?: AppUser | null; active?: 'teachers' | 'schools' | 'jobs' }> = ({ user, active }) => (
  <nav>
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between w-full">
      <a href="/" style="font-size:1.25rem;font-weight:700;color:var(--base-text);text-decoration:none;font-family:var(--font-heading)">
        EduConnect
      </a>
      <div class="flex items-center" style="gap:1rem">
        <a href="/schools" style={`font-size:0.875rem;text-decoration:none;${active === 'schools' ? 'color:var(--accent);font-weight:600' : 'color:var(--base-text-secondary)'}`}>
          For Schools
        </a>
        <a href="/jobs" style={`font-size:0.875rem;text-decoration:none;${active === 'jobs' ? 'color:var(--accent);font-weight:600' : 'color:var(--base-text-secondary)'}`}>
          Browse Jobs
        </a>
        {user ? (
          <>
            <a href={`/${user.role}-dashboard`} style="font-size:0.875rem;font-weight:500;color:var(--base-text);text-decoration:none">
              Dashboard
            </a>
            <a href="/profile" style="font-size:0.875rem;font-weight:500;color:var(--base-text);text-decoration:none">
              Profile
            </a>
            <a href="/logout" class="btn" style="padding:'0.4rem 0.8rem';font-size:0.875rem;background:'var(--base-surface)';color:'var(--base-text-secondary)';border:'1px solid var(--base-border)';border-radius:'6px'">Logout</a>
          </>
        ) : (
          <>
            <a href="/login" style="font-size:0.875rem;font-weight:500;color:var(--base-text);text-decoration:none">
              Log in
            </a>
            <a href="/register" class="btn btn-dark" style="padding:'0.5rem 1rem';font-size:0.875rem">
              Get Started
            </a>
          </>
        )}
      </div>
    </div>
  </nav>
)
