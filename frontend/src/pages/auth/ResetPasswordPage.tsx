import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../api/auth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const schema = z.object({
  password: z.string().min(8, '비밀번호는 8자 이상 입력하세요'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  async function onSubmit(data: FormData) {
    try {
      setError('')
      await authApi.resetPassword(token, data.password)
      navigate('/login', { state: { message: '비밀번호가 변경되었습니다. 다시 로그인해주세요.' } })
    } catch (err: any) {
      setError(err.response?.data?.message ?? '비밀번호 변경에 실패했습니다.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
        <div className="w-full text-center flex flex-col gap-4">
          <p className="text-gray-400 text-sm">유효하지 않은 링크입니다.</p>
          <Link to="/forgot-password" className="text-brand-400 text-sm hover:text-brand-300">
            비밀번호 찾기 다시 시도
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <div className="w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-500">MotoLog</h1>
          <p className="text-gray-500 mt-1 text-sm">새 비밀번호 설정</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="새 비밀번호"
            type="password"
            placeholder="8자 이상"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="새 비밀번호 확인"
            type="password"
            placeholder="비밀번호 재입력"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="lg">
            비밀번호 변경
          </Button>
        </form>
      </div>
    </div>
  )
}
