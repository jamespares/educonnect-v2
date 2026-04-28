const API_BASE = '/api'

async function fetchJson(path: string, options?: RequestInit): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  const data: any = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  auth: {
    me: () => fetchJson('/auth/me'),
    login: (body: { email: string; password: string }) =>
      fetchJson('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: { email: string; password: string; role: 'teacher' | 'school' }) =>
      fetchJson('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => fetchJson('/auth/logout', { method: 'POST' }),
  },
  teachers: {
    getProfile: () => fetchJson('/teachers/profile'),
    saveProfile: (body: Record<string, string | undefined>) =>
      fetchJson('/teachers/profile', { method: 'POST', body: JSON.stringify(body) }),
  },
  schools: {
    getProfile: () => fetchJson('/schools/profile'),
    saveProfile: (body: Record<string, string | undefined>) =>
      fetchJson('/schools/profile', { method: 'POST', body: JSON.stringify(body) }),
  },
  jobs: {
    list: (params?: { city?: string; subject?: string }) => {
      const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString() : ''
      return fetchJson(`/jobs${qs}`)
    },
    get: (id: number) => fetchJson(`/jobs/${id}`),
    create: (body: Record<string, unknown>) =>
      fetchJson('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  },
  applications: {
    apply: (jobId: number) =>
      fetchJson('/applications', { method: 'POST', body: JSON.stringify({ jobId }) }),
    myApplications: () => fetchJson('/applications/my'),
    forSchool: () => fetchJson('/applications/for-school'),
    updateStatus: (id: number, body: { status: string; notes?: string }) =>
      fetchJson(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  payments: {
    createCheckout: () =>
      fetchJson('/payments/create-checkout-session', { method: 'POST' }),
  },
}
