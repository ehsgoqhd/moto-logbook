import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const TERMS_OF_SERVICE = `제1조 (목적)
본 약관은 MotoLog(이하 "서비스")가 제공하는 오토바이 차계부 서비스 이용에 관한 조건 및 절차를 규정합니다.

제2조 (이용계약 체결)
이용계약은 회원이 본 약관에 동의하고 회원가입을 완료함으로써 성립됩니다.

제3조 (서비스 이용)
회원은 본 서비스를 통해 오토바이 등록, 주유·정비·비용 기록, 알림 등의 기능을 이용할 수 있습니다.

제4조 (회원의 의무)
회원은 타인의 정보를 도용하거나 서비스 운영을 방해하는 행위를 하여서는 안 됩니다.

제5조 (서비스 변경 및 중단)
서비스는 운영상 필요에 따라 서비스 내용을 변경하거나 중단할 수 있으며, 이 경우 사전 공지합니다.

제6조 (면책조항)
서비스는 회원이 입력한 데이터의 정확성에 대해 책임을 지지 않습니다.`

const PRIVACY_POLICY = `수집하는 개인정보 항목
- 필수: 이름, 이메일 주소, 비밀번호
- 선택: 프로필 사진, 오토바이 정보(차종, 번호판, 차대번호 등)

개인정보의 수집 및 이용 목적
- 회원 식별 및 서비스 제공
- 주유·정비·비용 기록 관리
- 정비·보험 만료 알림 발송

개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.

개인정보의 제3자 제공
- 법령에 의한 경우를 제외하고 제3자에게 제공하지 않습니다.

개인정보 처리 위탁
- 서비스는 이미지 저장을 위해 Cloudflare R2를 이용합니다.

정보주체의 권리
- 회원은 언제든지 자신의 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.`

const schema = z.object({
  name: z.string().min(2, '이름은 2자 이상 입력하세요'),
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상 입력하세요'),
  confirmPassword: z.string(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: '이용약관에 동의해주세요' }) }),
  agreePrivacy: z.literal(true, { errorMap: () => ({ message: '개인정보 처리방침에 동의해주세요' }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

function TermsModal({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-gray-900 rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm text-gray-400 whitespace-pre-line leading-relaxed">
          {content}
        </div>
        <div className="px-5 py-4 border-t border-gray-800">
          <Button className="w-full" onClick={onClose}>확인</Button>
        </div>
      </div>
    </div>
  )
}

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'terms' | 'privacy' | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
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

          <div className="flex flex-col gap-3 mt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-brand-500 cursor-pointer"
                {...register('agreeTerms')}
              />
              <span className="text-sm text-gray-400">
                <button
                  type="button"
                  onClick={() => setModal('terms')}
                  className="text-brand-400 underline underline-offset-2 hover:text-brand-300"
                >
                  이용약관
                </button>
                에 동의합니다 <span className="text-gray-600">(필수)</span>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-red-400 -mt-2 ml-7">{errors.agreeTerms.message}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-brand-500 cursor-pointer"
                {...register('agreePrivacy')}
              />
              <span className="text-sm text-gray-400">
                <button
                  type="button"
                  onClick={() => setModal('privacy')}
                  className="text-brand-400 underline underline-offset-2 hover:text-brand-300"
                >
                  개인정보 처리방침
                </button>
                에 동의합니다 <span className="text-gray-600">(필수)</span>
              </span>
            </label>
            {errors.agreePrivacy && (
              <p className="text-xs text-red-400 -mt-2 ml-7">{errors.agreePrivacy.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="lg">
            가입하기
          </Button>
        </form>

        {modal === 'terms' && (
          <TermsModal title="이용약관" content={TERMS_OF_SERVICE} onClose={() => setModal(null)} />
        )}
        {modal === 'privacy' && (
          <TermsModal title="개인정보 처리방침" content={PRIVACY_POLICY} onClose={() => setModal(null)} />
        )}

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
