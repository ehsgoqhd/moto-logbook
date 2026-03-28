import { api } from '../lib/axios'
import type { ApiResponse, PaginatedResponse, FuelRecord, FuelStats, CreateFuelLogInput } from '../types'

export const fuelLogsApi = {
  list: (motorcycleId: string, page = 1, limit = 20) =>
    api.get<ApiResponse<PaginatedResponse<FuelRecord>>>('/fuel-logs', {
      params: { motorcycleId, page, limit },
    }),

  stats: (motorcycleId: string) =>
    api.get<ApiResponse<FuelStats>>('/fuel-logs/stats', { params: { motorcycleId } }),

  create: (data: CreateFuelLogInput) =>
    api.post<ApiResponse<FuelRecord>>('/fuel-logs', data),

  update: (id: string, data: Partial<CreateFuelLogInput>) =>
    api.put<ApiResponse<FuelRecord>>(`/fuel-logs/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/fuel-logs/${id}`),
}
