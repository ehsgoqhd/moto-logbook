import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../api/auth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  async function onSubmit(data: FormData) {
    try {
      setError('')
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch {
      setError('요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <div className="w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-500">MotoLog</h1>
          <p className="text-gray-500 mt-1 text-sm">비밀번호 찾기</p>
        </div>

        {sent ? (
          <div className="text-center flex flex-col gap-4">
            <div className="bg-gray-900 rounded-2xl px-6 py-8">
              <p className="text-gray-300 text-sm leading-relaxed">
                입력한 이메일 주소로 비밀번호 재설정 링크를 발송했습니다.<br />
                이메일을 확인해주세요.
              </p>
            </div>
            <Link to="/login" className="text-sm text-brand-400 hover:text-brand-300">
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6 text-center">
              가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="이메일"
                type="email"
                placeholder="example@email.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}

              <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="lg">
                재설정 링크 보내기
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link to="/login" className="text-brand-400 font-medium">
                로그인으로 돌아가기
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
