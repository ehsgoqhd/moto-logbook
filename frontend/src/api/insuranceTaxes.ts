import { api } from '../lib/axios'
import type { ApiResponse, PaginatedResponse, ExpenseRecord, CreateInsuranceTaxInput } from '../types'

export const insuranceTaxesApi = {
  list: (motorcycleId: string, page = 1, limit = 20) =>
    api.get<ApiResponse<PaginatedResponse<ExpenseRecord>>>('/insurance-taxes', {
      params: { motorcycleId, page, limit },
    }),

  expiring: (motorcycleId?: string) =>
    api.get<ApiResponse<ExpenseRecord[]>>('/insurance-taxes/expiring', {
      params: motorcycleId ? { motorcycleId } : {},
    }),

  create: (data: CreateInsuranceTaxInput) =>
    api.post<ApiResponse<ExpenseRecord>>('/insurance-taxes', data),

  update: (id: string, data: Partial<CreateInsuranceTaxInput>) =>
    api.put<ApiResponse<ExpenseRecord>>(`/insurance-taxes/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/insurance-taxes/${id}`),
}
