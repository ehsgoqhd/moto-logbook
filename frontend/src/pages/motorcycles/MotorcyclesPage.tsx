import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motorcyclesApi } from '../../api/motorcycles'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'

export function MotorcyclesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: () => motorcyclesApi.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => motorcyclesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motorcycles'] }),
  })

  const motorcycles = data?.data.data ?? []

  return (
    <Layout
      title="내 오토바이"
      rightAction={
        <Button size="sm" onClick={() => navigate('/motorcycles/new')}>+ 추가</Button>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : motorcycles.length === 0 ? (
        <EmptyState
          icon="🏍"
          title="등록된 오토바이가 없습니다"
          description="오토바이를 추가해서 차계부를 시작하세요"
          action={{ label: '+ 오토바이 추가', onClick: () => navigate('/motorcycles/new') }}
        />
      ) : (
        <div className="flex flex-col gap-3 pt-2">
          {motorcycles.map((moto) => (
            <Card key={moto.id}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-3xl flex-shrink-0">
                  🏍
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-100 truncate">{moto.name}</p>
                    {!moto.isActive && <Badge variant="gray">비활성</Badge>}
                  </div>
                  <p className="text-sm text-gray-400">{moto.brand} {moto.model}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {moto.year}년식 {moto.engineCC ? `· ${moto.engineCC}cc` : ''} {moto.plateNumber ? `· ${moto.plateNumber}` : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-brand-400">{moto.currentMileage.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">km</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/motorcycles/${moto.id}/edit`)}
                >
                  수정
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  loading={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm(`"${moto.name}"을 삭제하시겠습니까?`)) {
                      deleteMutation.mutate(moto.id)
                    }
                  }}
                >
                  삭제
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}
