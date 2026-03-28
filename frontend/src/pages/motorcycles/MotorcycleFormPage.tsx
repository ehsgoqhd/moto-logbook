import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motorcyclesApi } from '../../api/motorcycles'
import { Layout } from '../../components/Layout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

const schema = z.object({
  name: z.string().min(1, '별칭을 입력하세요'),
  brand: z.string().min(1, '제조사를 입력하세요'),
  model: z.string().min(1, '모델명을 입력하세요'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  engineCC: z.coerce.number().optional().or(z.literal('')),
  plateNumber: z.string().optional(),
  color: z.string().optional(),
  currentMileage: z.coerce.number().min(0).optional(),
  purchaseMileage: z.coerce.number().min(0).optional(),
})

type FormData = z.infer<typeof schema>

export function MotorcycleFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const qc = useQueryClient()

  const { data: motoData, isLoading } = useQuery({
    queryKey: ['motorcycle', id],
    queryFn: () => motorcyclesApi.get(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (motoData?.data.data) {
      const m = motoData.data.data
      reset({
        name: m.name,
        brand: m.brand,
        model: m.model,
        year: m.year,
        engineCC: m.engineCC ?? '',
        plateNumber: m.plateNumber ?? '',
        color: m.color ?? '',
        currentMileage: m.currentMileage,
        purchaseMileage: m.purchaseMileage,
      })
    }
  }, [motoData, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        engineCC: data.engineCC ? Number(data.engineCC) : undefined,
      }
      return isEdit
        ? motorcyclesApi.update(id!, payload)
        : motorcyclesApi.create(payload as any)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['motorcycles'] })
      navigate('/motorcycles')
    },
  })

  if (isLoading) return <Layout title="수정"><LoadingSpinner /></Layout>

  return (
    <Layout title={isEdit ? '오토바이 수정' : '오토바이 추가'} hideNav>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4 pt-2">
        <Input label="별칭 *" placeholder="내 CBR500R" error={errors.name?.message} {...register('name')} />
        <Input label="제조사 *" placeholder="Honda" error={errors.brand?.message} {...register('brand')} />
        <Input label="모델명 *" placeholder="CBR500R" error={errors.model?.message} {...register('model')} />
        <Input label="연식 *" type="number" placeholder="2023" error={errors.year?.message} {...register('year')} />
        <Input label="배기량 (cc)" type="number" placeholder="500" {...register('engineCC')} />
        <Input label="번호판" placeholder="서울 가 1234" {...register('plateNumber')} />
        <Input label="색상" placeholder="매트 블랙" {...register('color')} />
        <Input label="현재 주행거리 (km)" type="number" placeholder="0" {...register('currentMileage')} />
        <Input label="구매 시 주행거리 (km)" type="number" placeholder="0" {...register('purchaseMileage')} />

        {mutation.isError && (
          <p className="text-sm text-red-400 text-center">
            {(mutation.error as any)?.response?.data?.message ?? '저장에 실패했습니다.'}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <Button variant="secondary" type="button" className="flex-1" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending} className="flex-1">
            {isEdit ? '수정 완료' : '추가하기'}
          </Button>
        </div>
      </form>
    </Layout>
  )
}
