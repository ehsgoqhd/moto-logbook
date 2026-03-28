import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motorcyclesApi } from '../../api/motorcycles'
import { maintenanceLogsApi } from '../../api/maintenanceLogs'
import { Layout } from '../../components/Layout'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { MAINTENANCE_CATEGORY_LABELS } from '../../types'
import type { MaintenanceCategory } from '../../types'

const CATEGORIES = Object.entries(MAINTENANCE_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))

const schema = z.object({
  motorcycleId: z.string().min(1, '오토바이를 선택하세요'),
  date: z.string().min(1, '날짜를 입력하세요'),
  mileage: z.coerce.number().min(0),
  category: z.string().min(1, '카테고리를 선택하세요'),
  title: z.string().min(1, '정비 항목명을 입력하세요'),
  description: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  shop: z.string().optional(),
  nextMileage: z.coerce.number().optional().or(z.literal('')),
  nextDate: z.string().optional(),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)

export function MaintenanceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const qc = useQueryClient()

  const { data: motosData } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: () => motorcyclesApi.list(),
    select: (d) => d.data.data,
  })

  const motorcycles = motosData ?? []

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, cost: 0, motorcycleId: '' },
  })

  useEffect(() => {
    if (motorcycles.length > 0 && !watch('motorcycleId')) {
      setValue('motorcycleId', motorcycles[0].id)
    }
  }, [motorcycles])

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        category: data.category as MaintenanceCategory,
        nextMileage: data.nextMileage ? Number(data.nextMileage) : undefined,
      }
      return isEdit
        ? maintenanceLogsApi.update(id!, payload)
        : maintenanceLogsApi.create(payload as any)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['maintenanceLogs', vars.motorcycleId] })
      qc.invalidateQueries({ queryKey: ['upcomingMaintenance', vars.motorcycleId] })
      navigate('/maintenance')
    },
  })

  return (
    <Layout title={isEdit ? '정비 기록 수정' : '정비 기록 추가'} hideNav>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4 pt-2">
        <Select
          label="오토바이 *"
          options={motorcycles.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="선택"
          error={errors.motorcycleId?.message}
          {...register('motorcycleId')}
        />
        <Input label="날짜 *" type="date" error={errors.date?.message} {...register('date')} />
        <Input label="주행거리 (km) *" type="number" error={errors.mileage?.message} {...register('mileage')} />
        <Select
          label="카테고리 *"
          options={CATEGORIES}
          placeholder="선택"
          error={errors.category?.message}
          {...register('category')}
        />
        <Input label="정비 항목명 *" placeholder="엔진오일 교환 5W-40" error={errors.title?.message} {...register('title')} />
        <Input label="상세 내용" placeholder="부품명, 작업 내용 등" {...register('description')} />
        <Input label="비용 (원)" type="number" placeholder="0" {...register('cost')} />
        <Input label="정비소" placeholder="공식 서비스센터" {...register('shop')} />
        <Input label="다음 정비 예정일" type="date" {...register('nextDate')} />
        <Input label="다음 정비 예정 주행거리 (km)" type="number" placeholder="20000" {...register('nextMileage')} />
        <Input label="메모" placeholder="특이사항" {...register('note')} />

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
