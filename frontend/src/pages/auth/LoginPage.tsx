import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const SAVED_EMAIL_KEY = 'motolog_saved_email'

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const successMessage = (location.state as { message?: string })?.message ?? ''

  const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY) ?? ''
  const [rememberEmail, setRememberEmail] = useState(savedEmail !== '')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: savedEmail },
  })

  async function onSubmit(data: FormData) {
    try {
      setError('')
      if (rememberEmail) {
        localStorage.setItem(SAVED_EMAIL_KEY, data.email)
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY)
      }
      const res = await authApi.login(data.email, data.password)
      const { accessToken, refreshToken, user } = res.data.data
      login(accessToken, refreshToken, user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '로그인에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <div className="w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-500">MotoLog</h1>
          <p className="text-gray-500 mt-1 text-sm">오토바이 차계부</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand-500 cursor-pointer"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
              />
              <span className="text-sm text-gray-400">이메일 저장</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">
              비밀번호 찾기
            </Link>
          </div>

          {successMessage && (
            <p className="text-sm text-green-400 text-center">{successMessage}</p>
          )}

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="lg">
            로그인
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-brand-400 font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
