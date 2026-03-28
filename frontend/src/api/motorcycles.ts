import { api } from '../lib/axios'
import type { ApiResponse, Motorcycle, CreateMotorcycleInput } from '../types'

export const motorcyclesApi = {
  list: () =>
    api.get<ApiResponse<Motorcycle[]>>('/motorcycles'),

  get: (id: string) =>
    api.get<ApiResponse<Motorcycle>>(`/motorcycles/${id}`),

  create: (data: CreateMotorcycleInput) =>
    api.post<ApiResponse<Motorcycle>>('/motorcycles', data),

  update: (id: string, data: Partial<CreateMotorcycleInput>) =>
    api.put<ApiResponse<Motorcycle>>(`/motorcycles/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/motorcycles/${id}`),
}
