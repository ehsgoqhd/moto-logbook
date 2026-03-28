// ── Common ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// ── Motorcycle ────────────────────────────────────────────────────────────

export interface Motorcycle {
  id: string
  userId: string
  name: string
  brand: string
  model: string
  year: number
  engineCC?: number
  plateNumber?: string
  vin?: string
  color?: string
  purchaseDate?: string
  purchaseMileage: number
  currentMileage: number
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMotorcycleInput {
  name: string
  brand: string
  model: string
  year: number
  engineCC?: number
  plateNumber?: string
  color?: string
  purchaseDate?: string
  purchaseMileage?: number
  currentMileage?: number
}

// ── Fuel ──────────────────────────────────────────────────────────────────

export type FuelType = 'GASOLINE' | 'PREMIUM' | 'DIESEL' | 'ELECTRIC'

export interface FuelRecord {
  id: string
  motorcycleId: string
  date: string
  mileage: number
  liters: number
  pricePerLiter: number
  totalCost: number
  fullTank: boolean
  station?: string
  fuelType: FuelType
  note?: string
  fuelEfficiency?: number
  createdAt: string
  updatedAt: string
}

export interface FuelStats {
  avgEfficiency: number | null
  thisMonthCost: number
  monthlyCosts: { month: string; cost: number; liters: number }[]
}

export interface CreateFuelLogInput {
  motorcycleId: string
  date: string
  mileage: number
  liters: number
  pricePerLiter: number
  totalCost: number
  fullTank?: boolean
  station?: string
  fuelType?: FuelType
  note?: string
}

// ── Maintenance ───────────────────────────────────────────────────────────

export type MaintenanceCategory =
  | 'OIL_CHANGE' | 'OIL_FILTER' | 'AIR_FILTER'
  | 'TIRE_FRONT' | 'TIRE_REAR'
  | 'BRAKE_PAD' | 'BRAKE_FLUID'
  | 'CHAIN' | 'SPARK_PLUG' | 'BATTERY' | 'COOLANT'
  | 'SUSPENSION' | 'VALVE' | 'BELT'
  | 'INSPECTION' | 'RECALL' | 'REPAIR' | 'CLEANING' | 'OTHER'

export const MAINTENANCE_CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  OIL_CHANGE: '엔진오일 교환',
  OIL_FILTER: '오일필터',
  AIR_FILTER: '에어필터',
  TIRE_FRONT: '앞타이어',
  TIRE_REAR: '뒷타이어',
  BRAKE_PAD: '브레이크 패드',
  BRAKE_FLUID: '브레이크 오일',
  CHAIN: '체인',
  SPARK_PLUG: '점화플러그',
  BATTERY: '배터리',
  COOLANT: '냉각수',
  SUSPENSION: '서스펜션',
  VALVE: '밸브 조정',
  BELT: '벨트',
  INSPECTION: '법정검사',
  RECALL: '리콜',
  REPAIR: '수리',
  CLEANING: '세차/청소',
  OTHER: '기타',
}

export interface MaintenanceRecord {
  id: string
  motorcycleId: string
  date: string
  mileage: number
  category: MaintenanceCategory
  title: string
  description?: string
  cost: number
  shop?: string
  nextMileage?: number
  nextDate?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface UpcomingMaintenanceResponse {
  currentMileage: number
  mileageThreshold: number
  items: MaintenanceRecord[]
}

export interface CreateMaintenanceLogInput {
  motorcycleId: string
  date: string
  mileage: number
  category: MaintenanceCategory
  title: string
  description?: string
  cost?: number
  shop?: string
  nextMileage?: number
  nextDate?: string
  note?: string
}

// ── Insurance / Tax ───────────────────────────────────────────────────────

export type ExpenseCategory = 'INSURANCE' | 'REGISTRATION' | 'TAX'

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  INSURANCE: '보험료',
  REGISTRATION: '등록/이전',
  TAX: '자동차세',
}

export interface ExpenseRecord {
  id: string
  motorcycleId: string
  date: string
  category: ExpenseCategory
  title: string
  amount: number
  expiryDate?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInsuranceTaxInput {
  motorcycleId: string
  date: string
  category: ExpenseCategory
  title: string
  amount: number
  expiryDate?: string
  note?: string
}
