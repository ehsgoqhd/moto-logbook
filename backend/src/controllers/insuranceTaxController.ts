import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const ALLOWED_CATEGORIES = ['INSURANCE', 'REGISTRATION', 'TAX'] as const

async function assertOwnership(motorcycleId: string, userId: string) {
  const moto = await prisma.motorcycle.findFirst({ where: { id: motorcycleId, userId } })
  return !!moto
}

// ── POST /api/insurance-taxes ─────────────────────────────────────────────

export async function createInsuranceTax(req: Request, res: Response) {
  const userId = req.user!.userId
  const { motorcycleId, date, category, title, amount, expiryDate, note } = req.body

  if (!motorcycleId || !date || !category || !title || amount == null) {
    res.status(400).json({
      success: false,
      message: '필수 항목 누락 (motorcycleId, date, category, title, amount)',
    })
    return
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    res.status(400).json({
      success: false,
      message: `category는 ${ALLOWED_CATEGORIES.join(', ')} 중 하나여야 합니다.`,
    })
    return
  }

  if (!(await assertOwnership(motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const record = await prisma.expenseRecord.create({
    data: {
      motorcycleId,
      date: new Date(date),
      category,
      title,
      amount: Number(amount),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      note: note ?? null,
    },
  })

  res.status(201).json({ success: true, data: record })
}

// ── GET /api/insurance-taxes ──────────────────────────────────────────────

export async function getInsuranceTaxes(req: Request, res: Response) {
  const userId = req.user!.userId
  const { motorcycleId, page = '1', limit = '20' } = req.query

  if (!motorcycleId) {
    res.status(400).json({ success: false, message: 'motorcycleId 쿼리 파라미터가 필요합니다.' })
    return
  }

  if (!(await assertOwnership(motorcycleId as string, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const take = Math.min(Number(limit), 100)
  const skip = (Number(page) - 1) * take
  const where = {
    motorcycleId: motorcycleId as string,
    category: { in: ALLOWED_CATEGORIES as unknown as any[] },
  }

  const [records, total] = await Promise.all([
    prisma.expenseRecord.findMany({ where, orderBy: { date: 'desc' }, take, skip }),
    prisma.expenseRecord.count({ where }),
  ])

  res.json({
    success: true,
    data: { items: records, total, page: Number(page), totalPages: Math.ceil(total / take) },
  })
}

// ── GET /api/insurance-taxes/expiring ────────────────────────────────────

export async function getExpiringInsuranceTaxes(req: Request, res: Response) {
  const userId = req.user!.userId
  const { motorcycleId } = req.query

  let motorcycleFilter: { motorcycleId: string } | { motorcycleId: { in: string[] } }

  if (motorcycleId) {
    const owned = await prisma.motorcycle.findFirst({
      where: { id: motorcycleId as string, userId },
    })
    if (!owned) {
      res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
      return
    }
    motorcycleFilter = { motorcycleId: motorcycleId as string }
  } else {
    const motos = await prisma.motorcycle.findMany({
      where: { userId },
      select: { id: true },
    })
    motorcycleFilter = { motorcycleId: { in: motos.map((m) => m.id) } }
  }

  const thirtyDaysLater = new Date()
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

  const records = await prisma.expenseRecord.findMany({
    where: {
      ...motorcycleFilter,
      category: { in: ALLOWED_CATEGORIES as unknown as any[] },
      expiryDate: { lte: thirtyDaysLater },
    },
    orderBy: { expiryDate: 'asc' },
  })

  res.json({ success: true, data: records })
}

// ── PUT /api/insurance-taxes/:id ──────────────────────────────────────────

export async function updateInsuranceTax(req: Request, res: Response) {
  const userId = req.user!.userId
  const { id } = req.params

  const existing = await prisma.expenseRecord.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ success: false, message: '기록을 찾을 수 없습니다.' })
    return
  }
  if (!(await assertOwnership(existing.motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const { date, category, title, amount, expiryDate, note } = req.body

  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    res.status(400).json({
      success: false,
      message: `category는 ${ALLOWED_CATEGORIES.join(', ')} 중 하나여야 합니다.`,
    })
    return
  }

  const updated = await prisma.expenseRecord.update({
    where: { id },
    data: {
      ...(date != null && { date: new Date(date) }),
      ...(category != null && { category }),
      ...(title != null && { title }),
      ...(amount != null && { amount: Number(amount) }),
      ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
      ...(note !== undefined && { note }),
    },
  })

  res.json({ success: true, data: updated })
}

// ── DELETE /api/insurance-taxes/:id ──────────────────────────────────────

export async function deleteInsuranceTax(req: Request, res: Response) {
  const userId = req.user!.userId
  const { id } = req.params

  const existing = await prisma.expenseRecord.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ success: false, message: '기록을 찾을 수 없습니다.' })
    return
  }
  if (!(await assertOwnership(existing.motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  await prisma.expenseRecord.delete({ where: { id } })
  res.json({ success: true, data: null, message: '삭제되었습니다.' })
}
