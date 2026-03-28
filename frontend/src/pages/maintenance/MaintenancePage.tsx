import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motorcyclesApi } from '../../api/motorcycles'
import { maintenanceLogsApi } from '../../api/maintenanceLogs'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { MAINTENANCE_CATEGORY_LABELS } from '../../types'

export function MaintenancePage() {
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
    queryKey: ['maintenanceLogs', motoId],
    queryFn: () => maintenanceLogsApi.list(motoId!),
    enabled: !!motoId,
    select: (d) => d.data.data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => maintenanceLogsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenanceLogs', motoId] }),
  })

  const logs = logsData?.items ?? []

  const categoryColors: Record<string, 'orange' | 'blue' | 'green' | 'gray'> = {
    OIL_CHANGE: 'orange', OIL_FILTER: 'orange',
    TIRE_FRONT: 'blue', TIRE_REAR: 'blue',
    BRAKE_PAD: 'green', BRAKE_FLUID: 'green',
  }

  return (
    <Layout
      title="정비 기록"
      rightAction={motoId && <Button size="sm" onClick={() => navigate('/maintenance/new')}>+ 추가</Button>}
    >
      {motorcycles.length > 1 && (
        <div className="flex gap-2 pt-2 pb-1 overflow-x-auto">
          {motorcycles.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMotoId(m.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
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
      ) : logs.length === 0 ? (
        <EmptyState icon="🔧" title="정비 기록이 없습니다" action={{ label: '+ 정비 기록 추가', onClick: () => navigate('/maintenance/new') }} />
      ) : (
        <div className="flex flex-col gap-2 pt-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-100">{log.title}</p>
                    <Badge variant={categoryColors[log.category] ?? 'gray'}>
                      {MAINTENANCE_CATEGORY_LABELS[log.category]}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.date).toLocaleDateString('ko-KR')} · {log.mileage.toLocaleString()} km
                  </p>
                  {log.shop && <p className="text-xs text-gray-500">{log.shop}</p>}
                  {log.description && <p className="text-xs text-gray-400 mt-1">{log.description}</p>}
                  {(log.nextDate || log.nextMileage) && (
                    <p className="text-xs text-brand-400 mt-1">
                      다음 정비:{' '}
                      {log.nextDate && new Date(log.nextDate).toLocaleDateString('ko-KR')}
                      {log.nextMileage && ` · ${log.nextMileage.toLocaleString()} km`}
                    </p>
                  )}
                </div>
                <div className="text-right ml-2">
                  <p className="font-semibold text-gray-100">{log.cost.toLocaleString()}원</p>
                  <div className="flex gap-1 mt-2 justify-end">
                    <button onClick={() => navigate(`/maintenance/${log.id}/edit`)} className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded-lg">수정</button>
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
    </Layout>
  )
}
