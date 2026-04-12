import { api } from '../lib/axios'
import type { ApiResponse, RepairShop } from '../types'

export const shopsApi = {
  list: (brand?: string) =>
    api.get<ApiResponse<RepairShop[]>>('/shops', { params: brand ? { brand } : undefined }),

  get: (id: string) =>
    api.get<ApiResponse<RepairShop>>(`/shops/${id}`),
}
