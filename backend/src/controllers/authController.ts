import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { JwtPayload } from '../middlewares/auth'

const JWT_SECRET = () => process.env.JWT_SECRET!
const REFRESH_SECRET = () => (process.env.JWT_SECRET! + '_refresh')

function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: '15m' })
}

function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, REFRESH_SECRET(), { expiresIn: '7d' })
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    res.status(400).json({ success: false, message: '이메일, 비밀번호, 이름은 필수입니다.' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
  })

  const payload: JwtPayload = { userId: user.id, email: user.email }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } })

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    },
  })
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ success: false, message: '이메일과 비밀번호를 입력해주세요.' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    return
  }

  const payload: JwtPayload = { userId: user.id, email: user.email }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } })

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    },
  })
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body

  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'refreshToken이 필요합니다.' })
    return
  }

  let payload: JwtPayload
  try {
    payload = jwt.verify(refreshToken, REFRESH_SECRET()) as JwtPayload
  } catch {
    res.status(401).json({ success: false, message: '유효하지 않거나 만료된 refreshToken입니다.' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || user.refreshToken !== refreshToken) {
    res.status(401).json({ success: false, message: '토큰이 무효화되었습니다.' })
    return
  }

  const newPayload: JwtPayload = { userId: user.id, email: user.email }
  const accessToken = signAccessToken(newPayload)

  res.json({ success: true, data: { accessToken } })
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body

  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET()) as JwtPayload
      await prisma.user.update({
        where: { id: payload.userId },
        data: { refreshToken: null },
      })
    } catch {
      // 만료된 토큰도 로그아웃 허용
    }
  }

  res.json({ success: true, data: null, message: '로그아웃 되었습니다.' })
}

// POST /api/auth/forgot-password
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body

  if (!email) {
    res.status(400).json({ success: false, message: '이메일을 입력해주세요.' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // 보안상 사용자 존재 여부와 관계없이 동일한 응답 반환
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 1000 * 60 * 60) // 1시간

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    })

    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${token}`

    if (process.env.NODE_ENV === 'development') {
      console.log('\n[비밀번호 재설정 링크]', resetUrl, '\n')
    }
    // TODO: 프로덕션에서는 이메일 발송으로 교체
  }

  res.json({ success: true, message: '입력한 이메일로 재설정 링크를 발송했습니다.' })
}

// POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body

  if (!token || !password) {
    res.status(400).json({ success: false, message: '토큰과 새 비밀번호를 입력해주세요.' })
    return
  }

  if (password.length < 8) {
    res.status(400).json({ success: false, message: '비밀번호는 8자 이상이어야 합니다.' })
    return
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() },
    },
  })

  if (!user) {
    res.status(400).json({ success: false, message: '유효하지 않거나 만료된 링크입니다.' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
  })

  res.json({ success: true, message: '비밀번호가 변경되었습니다. 다시 로그인해주세요.' })
}

// GET /api/auth/me
export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, avatarUrl: true, role: true, createdAt: true },
  })

  if (!user) {
    res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' })
    return
  }

  res.json({ success: true, data: { user } })
}
