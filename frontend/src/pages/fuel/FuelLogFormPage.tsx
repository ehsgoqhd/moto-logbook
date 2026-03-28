import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motorcyclesApi } from '../../api/motorcycles'
import { fuelLogsApi } from '../../api/fuelLogs'
import { Layout } from '../../components/Layout'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

const schema = z.object({
  motorcycleId: z.string().min(1, '오토바이를 선택하세요'),
  date: z.string().min(1, '날짜를 입력하세요'),
  mileage: z.coerce.number().min(0, '주행거리를 입력하세요'),
  liters: z.coerce.number().min(0.1, '주유량을 입력하세요'),
  pricePerLiter: z.coerce.number().min(1, '리터당 가격을 입력하세요'),
  totalCost: z.coerce.number().min(1, '총 금액을 입력하세요'),
  fullTank: z.boolean(),
  station: z.string().optional(),
  fuelType: z.enum(['GASOLINE', 'PREMIUM', 'DIESEL', 'ELECTRIC']),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)

export function FuelLogFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const qc = useQueryClient()

  const { data: motosData } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: () => motorcyclesApi.list(),
    select: (d) => d.data.data,
  })

  const { data: logData, isLoading } = useQuery({
    queryKey: ['fuelLog', id],
    queryFn: () => fuelLogsApi.list(id!),
    enabled: false, // edit은 list에서 가져옴, 별도 get API 없음
  })

  const motorcycles = motosData ?? []

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: today,
      fullTank: true,
      fuelType: 'GASOLINE',
      motorcycleId: motorcycles[0]?.id ?? '',
    },
  })

  // 오토바이 목록 로드 후 기본값 설정
  useEffect(() => {
    if (motorcycles.length > 0 && !watch('motorcycleId')) {
      setValue('motorcycleId', motorcycles[0].id)
    }
  }, [motorcycles, setValue, watch])

  // 주유량 × 단가 → 총금액 자동 계산
  const liters = watch('liters')
  const pricePerLiter = watch('pricePerLiter')
  useEffect(() => {
    if (liters && pricePerLiter) {
      setValue('totalCost', Math.round(liters * pricePerLiter))
    }
  }, [liters, pricePerLiter, setValue])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? fuelLogsApi.update(id!, data) : fuelLogsApi.create(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fuelLogs', vars.motorcycleId] })
      qc.invalidateQueries({ queryKey: ['fuelStats', vars.motorcycleId] })
      navigate('/fuel')
    },
  })

  if (isLoading) return <Layout title="수정"><LoadingSpinner /></Layout>

  return (
    <Layout title={isEdit ? '주유 기록 수정' : '주유 기록 추가'} hideNav>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4 pt-2">
        <Select
          label="오토바이 *"
          options={motorcycles.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="오토바이 선택"
          error={errors.motorcycleId?.message}
          {...register('motorcycleId')}
        />
        <Input label="날짜 *" type="date" error={errors.date?.message} {...register('date')} />
        <Input label="주행거리 (km) *" type="number" placeholder="15000" error={errors.mileage?.message} {...register('mileage')} />
        <Input label="주유량 (L) *" type="number" step="0.01" placeholder="15.5" error={errors.liters?.message} {...register('liters')} />
        <Input label="리터당 가격 (원) *" type="number" placeholder="1700" error={errors.pricePerLiter?.message} {...register('pricePerLiter')} />
        <Input label="총 금액 (원) *" type="number" error={errors.totalCost?.message} {...register('totalCost')} />
        <Select
          label="연료 종류"
          options={[
            { value: 'GASOLINE', label: '일반 휘발유' },
            { value: 'PREMIUM', label: '고급 휘발유' },
            { value: 'DIESEL', label: '디젤' },
            { value: 'ELECTRIC', label: '전기' },
          ]}
          {...register('fuelType')}
        />
        <Input label="주유소명" placeholder="SK에너지 강남점" {...register('station')} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="fullTank" className="w-4 h-4 accent-brand-500" {...register('fullTank')} />
          <label htmlFor="fullTank" className="text-sm text-gray-300">만탱크 주유</label>
        </div>
        <Input label="메모" placeholder="특이사항 입력" {...register('note')} />

        {mutation.isError && (
          <p className="text-sm text-red-400 text-center">
            {(mutation.error as any)?.response?.data?.message ?? '저장에 실패했습니다.'}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <Button variant="secondary" type="button" className="flex-1" onClick={() => navigate(-1)}>취소</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending} className="flex-1">
            {isEdit ? '수정 완료' : '기록 추가'}
          </Button>
        </div>
      </form>
    </Layout>
  )
}
