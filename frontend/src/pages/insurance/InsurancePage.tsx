import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motorcyclesApi } from '../../api/motorcycles'
import { insuranceTaxesApi } from '../../api/insuranceTaxes'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EXPENSE_CATEGORY_LABELS } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

function daysUntil(dateStr?: string) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

export function InsurancePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { logout } = useAuth()
  const [selectedMotoId, setSelectedMotoId] = useState<string>('')

  const { data: motosData } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: () => motorcyclesApi.list(),
    select: (d) => d.data.data,
  })

  const motorcycles = motosData ?? []
  const motoId = selectedMotoId || motorcycles[0]?.id

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['insuranceTaxes', motoId],
    queryFn: () => insuranceTaxesApi.list(motoId!),
    enabled: !!motoId,
    select: (d) => d.data.data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => insuranceTaxesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insuranceTaxes', motoId] }),
  })

  const logs = logsData?.items ?? []

  return (
    <Layout
      title="더보기"
      rightAction={motoId && <Button size="sm" onClick={() => navigate('/more/new')}>+ 추가</Button>}
    >
      <div className="flex flex-col gap-4 pt-2">
        {/* 계정 섹션 */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300">보험 / 세금 관리</p>
          </div>
        </Card>

        {/* 오토바이 선택 */}
        {motorcycles.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
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
          <EmptyState icon="📋" title="보험/세금 기록이 없습니다" action={{ label: '+ 기록 추가', onClick: () => navigate('/more/new') }} />
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map((log) => {
              const days = daysUntil(log.expiryDate)
              return (
                <Card key={log.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-100">{log.title}</p>
                        <Badge variant="blue">{EXPENSE_CATEGORY_LABELS[log.category]}</Badge>
                        {days !== null && (
                          <Badge variant={days <= 0 ? 'red' : days <= 30 ? 'orange' : 'gray'}>
                            {days <= 0 ? '만료됨' : `${days}일 후 만료`}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.date).toLocaleDateString('ko-KR')}
                        {log.expiryDate && ` · 만료: ${new Date(log.expiryDate).toLocaleDateString('ko-KR')}`}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-semibold text-gray-100">{log.amount.toLocaleString()}원</p>
                      <div className="flex gap-1 mt-2 justify-end">
                        <button onClick={() => navigate(`/more/${log.id}/edit`)} className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded-lg">수정</button>
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
              )
            })}
          </div>
        )}

        {/* 로그아웃 */}
        <Button variant="ghost" className="w-full mt-4 text-gray-500" onClick={logout}>
          로그아웃
        </Button>
      </div>
    </Layout>
  )
}
