import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motorcyclesApi } from '../api/motorcycles'
import { fuelLogsApi } from '../api/fuelLogs'
import { maintenanceLogsApi } from '../api/maintenanceLogs'
import { insuranceTaxesApi } from '../api/insuranceTaxes'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { MAINTENANCE_CATEGORY_LABELS } from '../types'

function formatCost(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function daysUntil(dateStr?: string) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  return diff
}

export function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: motosData, isLoading } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: () => motorcyclesApi.list(),
  })

  const motorcycles = motosData?.data.data ?? []
  const primaryMoto = motorcycles[0]

  const { data: fuelStatsData } = useQuery({
    queryKey: ['fuelStats', primaryMoto?.id],
    queryFn: () => fuelLogsApi.stats(primaryMoto!.id),
    enabled: !!primaryMoto,
  })

  const { data: upcomingData } = useQuery({
    queryKey: ['upcomingMaintenance', primaryMoto?.id],
    queryFn: () => maintenanceLogsApi.upcoming(primaryMoto!.id),
    enabled: !!primaryMoto,
  })

  const { data: expiringData } = useQuery({
    queryKey: ['expiringInsurance'],
    queryFn: () => insuranceTaxesApi.expiring(),
  })

  const fuelStats = fuelStatsData?.data.data
  const upcoming = upcomingData?.data.data?.items ?? []
  const expiring = expiringData?.data.data ?? []

  if (isLoading) return <Layout title="홈"><LoadingSpinner /></Layout>

  return (
    <Layout
      title="홈"
      rightAction={
        <button onClick={logout} className="text-sm text-gray-500 px-2 py-1">
          로그아웃
        </button>
      }
    >
      <div className="flex flex-col gap-4 pt-2 pb-4">
        {/* 인사 */}
        <p className="text-gray-400 text-sm">안녕하세요, <span className="text-gray-200 font-medium">{user?.name}</span>님</p>

        {/* 오토바이 없을 때 */}
        {motorcycles.length === 0 && (
          <Card onClick={() => navigate('/motorcycles/new')}>
            <div className="flex flex-col items-center py-6 gap-3">
              <span className="text-4xl">🏍</span>
              <p className="text-gray-300 font-medium">오토바이를 등록하세요</p>
              <p className="text-sm text-gray-500">차계부를 시작하려면 먼저 오토바이를 추가해주세요</p>
            </div>
          </Card>
        )}

        {/* 대표 오토바이 카드 */}
        {primaryMoto && (
          <Card onClick={() => navigate('/motorcycles')}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">
                🏍
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-100 truncate">{primaryMoto.name}</p>
                <p className="text-sm text-gray-400">{primaryMoto.brand} {primaryMoto.model} · {primaryMoto.year}년식</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-brand-400">{primaryMoto.currentMileage.toLocaleString()}</p>
                <p className="text-xs text-gray-500">km</p>
              </div>
            </div>
          </Card>
        )}

        {/* 주유 통계 */}
        {fuelStats && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-gray-500 mb-1">이번달 주유비</p>
              <p className="text-lg font-bold text-gray-100">{formatCost(fuelStats.thisMonthCost)}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 mb-1">평균 연비</p>
              <p className="text-lg font-bold text-gray-100">
                {fuelStats.avgEfficiency != null ? `${fuelStats.avgEfficiency} km/L` : '-'}
              </p>
            </Card>
          </div>
        )}

        {/* 임박 정비 */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-2">임박한 정비</h2>
            <div className="flex flex-col gap-2">
              {upcoming.slice(0, 3).map((item) => (
                <Card key={item.id} onClick={() => navigate('/maintenance')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-100">{item.title}</p>
                      <p className="text-xs text-gray-500">{MAINTENANCE_CATEGORY_LABELS[item.category]}</p>
                    </div>
                    <div className="text-right">
                      {item.nextDate && (
                        <Badge variant={daysUntil(item.nextDate)! <= 7 ? 'red' : 'orange'}>
                          {formatDate(item.nextDate)}
                        </Badge>
                      )}
                      {item.nextMileage && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.nextMileage.toLocaleString()} km</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 만료 임박 보험/세금 */}
        {expiring.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-2">만료 임박</h2>
            <div className="flex flex-col gap-2">
              {expiring.slice(0, 3).map((item) => (
                <Card key={item.id} onClick={() => navigate('/more')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-100">{item.title}</p>
                      <p className="text-xs text-gray-500">{formatCost(item.amount)}</p>
                    </div>
                    {item.expiryDate && (
                      <Badge variant={daysUntil(item.expiryDate)! <= 7 ? 'red' : 'orange'}>
                        {daysUntil(item.expiryDate)! > 0 ? `${daysUntil(item.expiryDate)}일 후` : '만료'}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 빠른 기록 버튼 */}
        {primaryMoto && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-2">빠른 기록</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '주유', emoji: '⛽', path: '/fuel/new' },
                { label: '정비', emoji: '🔧', path: '/maintenance/new' },
                { label: '보험/세금', emoji: '📋', path: '/more/new' },
              ].map((btn) => (
                <Card key={btn.path} onClick={() => navigate(btn.path)} className="flex flex-col items-center gap-2 py-4">
                  <span className="text-2xl">{btn.emoji}</span>
                  <span className="text-xs text-gray-400">{btn.label}</span>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
