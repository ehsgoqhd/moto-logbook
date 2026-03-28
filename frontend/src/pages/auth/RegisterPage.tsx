import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const schema = z.object({
  name: z.string().min(2, '이름은 2자 이상 입력하세요'),
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상 입력하세요'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      setError('')
      const res = await authApi.register(data.email, data.password, data.name)
      const { accessToken, refreshToken, user } = res.data.data
      login(accessToken, refreshToken, user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '회원가입에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <div className="w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-500">MotoLog</h1>
          <p className="text-gray-500 mt-1 text-sm">새 계정 만들기</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="이름"
            placeholder="홍길동"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="8자 이상"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호 재입력"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="lg">
            가입하기
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-brand-400 font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
