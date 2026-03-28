import { api } from '../lib/axios'
import type { LoginResponse } from '../types'

export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post<{ success: boolean; data: LoginResponse }>('/auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: LoginResponse }>('/auth/login', { email, password }),

  me: () =>
    api.get<{ success: boolean; data: { user: import('../types').User } }>('/auth/me'),
}
