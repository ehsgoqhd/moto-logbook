import { api } from '../lib/axios'
import type {
  ApiResponse, PaginatedResponse,
  MaintenanceRecord, UpcomingMaintenanceResponse,
  CreateMaintenanceLogInput, MaintenanceCategory,
} from '../types'

export const maintenanceLogsApi = {
  list: (motorcycleId: string, page = 1, limit = 20, category?: MaintenanceCategory) =>
    api.get<ApiResponse<PaginatedResponse<MaintenanceRecord>>>('/maintenance-logs', {
      params: { motorcycleId, page, limit, ...(category ? { category } : {}) },
    }),

  upcoming: (motorcycleId: string) =>
    api.get<ApiResponse<UpcomingMaintenanceResponse>>('/maintenance-logs/upcoming', {
      params: { motorcycleId },
    }),

  create: (data: CreateMaintenanceLogInput) =>
    api.post<ApiResponse<MaintenanceRecord>>('/maintenance-logs', data),

  update: (id: string, data: Partial<CreateMaintenanceLogInput>) =>
    api.put<ApiResponse<MaintenanceRecord>>(`/maintenance-logs/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/maintenance-logs/${id}`),
}
