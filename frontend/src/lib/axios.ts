import axios from 'axios'

// VITE_API_URL 이 설정되면 그대로 사용, 없으면 기본값
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: accessToken 자동 첨부 ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: 401 시 refresh → 재시도 ────────────────────────────────────
let isRefreshing = false
let failQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err)
    }

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(err)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
      const newToken = data.data.accessToken
      localStorage.setItem('accessToken', newToken)
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`
      processQueue(null, newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  },
)

export function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}
