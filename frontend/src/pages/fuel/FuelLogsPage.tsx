import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { motorcyclesApi } from '../../api/motorcycles'
import { fuelLogsApi } from '../../api/fuelLogs'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export function FuelLogsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [selectedMotoId, setSelectedMotoId] = useState<string>('')

  const { data: motosData } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: () => motorcyclesApi.list(),
    select: (d) => d.data.data,
  })

  const motorcycles = motosData ?? []
  const motoId = selectedMotoId || motorcycles[0]?.id

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['fuelLogs', motoId],
    queryFn: () => fuelLogsApi.list(motoId!),
    enabled: !!motoId,
    select: (d) => d.data.data,
  })

  const { data: statsData } = useQuery({
    queryKey: ['fuelStats', motoId],
    queryFn: () => fuelLogsApi.stats(motoId!),
    enabled: !!motoId,
    select: (d) => d.data.data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fuelLogsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fuelLogs', motoId] })
      qc.invalidateQueries({ queryKey: ['fuelStats', motoId] })
    },
  })

  const logs = logsData?.items ?? []
  const stats = statsData

  return (
    <Layout
      title="주유 기록"
      rightAction={
        motoId && <Button size="sm" onClick={() => navigate('/fuel/new')}>+ 추가</Button>
      }
    >
      {/* 오토바이 선택 */}
      {motorcycles.length > 1 && (
        <div className="flex gap-2 pt-2 pb-1 overflow-x-auto">
          {motorcycles.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMotoId(m.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                motoId === m.id ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {!motoId ? (
        <EmptyState icon="🏍" title="오토바이를 먼저 등록하세요" action={{ label: '오토바이 추가', onClick: () => navigate('/motorcycles/new') }} />
      ) : isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col gap-4 pt-2">
          {/* 통계 카드 */}
          {stats && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <p className="text-xs text-gray-500 mb-1">이번달 주유비</p>
                  <p className="text-lg font-bold text-gray-100">{stats.thisMonthCost.toLocaleString()}원</p>
                </Card>
                <Card>
                  <p className="text-xs text-gray-500 mb-1">평균 연비</p>
                  <p className="text-lg font-bold text-gray-100">
                    {stats.avgEfficiency != null ? `${stats.avgEfficiency} km/L` : '-'}
                  </p>
                </Card>
              </div>

              {/* 월별 차트 */}
              {stats.monthlyCosts.some((m) => m.cost > 0) && (
                <Card>
                  <p className="text-xs text-gray-500 mb-3">최근 6개월 주유비</p>
                  <Line
                    data={{
                      labels: stats.monthlyCosts.map((m) => m.month.slice(5) + '월'),
                      datasets: [{
                        label: '주유비',
                        data: stats.monthlyCosts.map((m) => m.cost),
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249,115,22,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#f97316',
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
                        y: { ticks: { color: '#6b7280', callback: (v) => (Number(v) / 1000) + 'k' }, grid: { color: '#1f2937' } },
                      },
                    }}
                  />
                </Card>
              )}
            </>
          )}

          {/* 기록 목록 */}
          {logs.length === 0 ? (
            <EmptyState icon="⛽" title="주유 기록이 없습니다" action={{ label: '+ 주유 기록 추가', onClick: () => navigate('/fuel/new') }} />
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log) => (
                <Card key={log.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-100">
                          {new Date(log.date).toLocaleDateString('ko-KR')}
                        </p>
                        {log.fullTank && <Badge variant="blue">만탱크</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {log.mileage.toLocaleString()} km · {log.station || '주유소 미입력'}
                      </p>
                      <div className="flex gap-3 mt-2">
                        <span className="text-xs text-gray-400">{log.liters}L</span>
                        <span className="text-xs text-gray-400">{log.pricePerLiter.toLocaleString()}원/L</span>
                        {log.fuelEfficiency && (
                          <span className="text-xs text-brand-400">{log.fuelEfficiency} km/L</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-100">{log.totalCost.toLocaleString()}원</p>
                      <div className="flex gap-1 mt-2 justify-end">
                        <button onClick={() => navigate(`/fuel/${log.id}/edit`)} className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded-lg">수정</button>
                        <button
                          onClick={() => { if (confirm('삭제하시겠습니까?')) deleteMutation.mutate(log.id) }}
                          className="text-xs text-red-400 px-2 py-1 bg-gray-800 rounded-lg"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
