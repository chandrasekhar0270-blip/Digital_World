import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

/* ─── Response Interceptor ─── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      // Redirect to sign-in on auth failure
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in'
      }
    }
    return Promise.reject(error)
  }
)

/* ─── Projects (Work) ─── */
export const projectsAPI = {
  getProjects: async () => {
    const { data } = await api.get('/projects')
    return data
  },
  createProject: async (project: {
    name: string
    description?: string
    status?: string
  }) => {
    const { data } = await api.post('/projects', project)
    return data
  },
}

/* ─── Finance (Money) ─── */
export const financeAPI = {
  getAccounts: async () => {
    const { data } = await api.get('/finance')
    return data
  },
  getNetWorth: async () => {
    const { data } = await api.get('/finance/net-worth')
    return data
  },
  addAccount: async (account: {
    name: string
    type: string
    balance: number
    currency?: string
  }) => {
    const { data } = await api.post('/finance', account)
    return data
  },
}

/* ─── Fitness (Health / RunPulse) ─── */
export const fitnessAPI = {
  getRuns: async () => {
    const { data } = await api.get('/fitness')
    return data
  },
  getStats: async () => {
    const { data } = await api.get('/fitness/stats')
    return data
  },
  getCoachAdvice: async (prompt: string) => {
    const { data } = await api.post('/fitness/coach', { prompt })
    return data
  },
  logRun: async (run: {
    distance_km: number
    duration_minutes: number
    date: string
    notes?: string
  }) => {
    const { data } = await api.post('/fitness', run)
    return data
  },
}
