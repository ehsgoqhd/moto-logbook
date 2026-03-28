import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motorcyclesApi } from '../../api/motorcycles'
import { insuranceTaxesApi } from '../../api/insuranceTaxes'
import { Layout } from '../../components/Layout'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import type { ExpenseCategory } from '../../types'

const schema = z.object({
  motorcycleId: z.string().min(1, '오토바이를 선택하세요'),
  date: z.string().min(1, '날짜를 입력하세요'),
  category: z.enum(['INSURANCE', 'REGISTRATION', 'TAX']),
  title: z.string().min(1, '항목명을 입력하세요'),
  amount: z.coerce.number().min(1, '금액을 입력하세요'),
  expiryDate: z.string().optional(),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)

export function InsuranceFormPage() {
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

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, category: 'INSURANCE', motorcycleId: '' },
  })

  useEffect(() => {
    if (motorcycles.length > 0 && !watch('motorcycleId')) {
      setValue('motorcycleId', motorcycles[0].id)
    }
  }, [motorcycles])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? insuranceTaxesApi.update(id!, data)
        : insuranceTaxesApi.create(data as any),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['insuranceTaxes', vars.motorcycleId] })
      qc.invalidateQueries({ queryKey: ['expiringInsurance'] })
      navigate('/more')
    },
  })

  return (
    <Layout title={isEdit ? '보험/세금 수정' : '보험/세금 추가'} hideNav>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4 pt-2">
        <Select
          label="오토바이 *"
          options={motorcycles.map((m) => ({ value: m.id, label: m.name }))}
          placeholder="선택"
          error={errors.motorcycleId?.message}
          {...register('motorcycleId')}
        />
        <Select
          label="종류 *"
          options={[
            { value: 'INSURANCE', label: '보험료' },
            { value: 'REGISTRATION', label: '등록/이전' },
            { value: 'TAX', label: '자동차세' },
          ]}
          {...register('category')}
        />
        <Input label="항목명 *" placeholder="책임보험 갱신" error={errors.title?.message} {...register('title')} />
        <Input label="납부 날짜 *" type="date" error={errors.date?.message} {...register('date')} />
        <Input label="금액 (원) *" type="number" error={errors.amount?.message} {...register('amount')} />
        <Input label="만료일" type="date" {...register('expiryDate')} />
        <Input label="메모" placeholder="보험사, 증권번호 등" {...register('note')} />

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
