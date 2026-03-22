import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// ── Helpers ───────────────────────────────────────────────────────────────

async function assertOwnership(motorcycleId: string, userId: string) {
  const moto = await prisma.motorcycle.findFirst({ where: { id: motorcycleId, userId } })
  return !!moto
}

// ── POST /api/maintenance-logs ────────────────────────────────────────────

export async function createMaintenanceLog(req: Request, res: Response) {
  const userId = req.user!.userId
  const {
    motorcycleId, date, mileage, category, title,
    description, cost, shop, shopId, nextMileage, nextDate, note,
  } = req.body

  if (!motorcycleId || !date || mileage == null || !category || !title) {
    res.status(400).json({
      success: false,
      message: '필수 항목 누락 (motorcycleId, date, mileage, category, title)',
    })
    return
  }

  if (!(await assertOwnership(motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const record = await prisma.maintenanceRecord.create({
    data: {
      motorcycleId,
      date: new Date(date),
      mileage: Number(mileage),
      category,
      title,
      description: description ?? null,
      cost: cost != null ? Number(cost) : 0,
      shop: shop ?? null,
      shopId: shopId ?? null,
      nextMileage: nextMileage != null ? Number(nextMileage) : null,
      nextDate: nextDate ? new Date(nextDate) : null,
      note: note ?? null,
    },
  })

  res.status(201).json({ success: true, data: record })
}

// ── GET /api/maintenance-logs ─────────────────────────────────────────────

export async function getMaintenanceLogs(req: Request, res: Response) {
  const userId = req.user!.userId
  const { motorcycleId, page = '1', limit = '20', category } = req.query

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
    ...(category ? { category: category as any } : {}),
  }

  const [records, total] = await Promise.all([
    prisma.maintenanceRecord.findMany({ where, orderBy: { date: 'desc' }, take, skip }),
    prisma.maintenanceRecord.count({ where }),
  ])

  res.json({
    success: true,
    data: { items: records, total, page: Number(page), totalPages: Math.ceil(total / take) },
  })
}

// ── GET /api/maintenance-logs/upcoming ───────────────────────────────────

export async function getUpcomingMaintenance(req: Request, res: Response) {
  const userId = req.user!.userId
  const { motorcycleId } = req.query

  if (!motorcycleId) {
    res.status(400).json({ success: false, message: 'motorcycleId 쿼리 파라미터가 필요합니다.' })
    return
  }

  const moto = await prisma.motorcycle.findFirst({
    where: { id: motorcycleId as string, userId },
  })
  if (!moto) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
  const mileageThreshold = moto.currentMileage + 500

  const records = await prisma.maintenanceRecord.findMany({
    where: {
      motorcycleId: moto.id,
      OR: [
        { nextMileage: { lte: mileageThreshold } },
        { nextDate: { lte: sevenDaysLater } },
      ],
    },
    orderBy: [{ nextDate: 'asc' }, { nextMileage: 'asc' }],
  })

  res.json({
    success: true,
    data: { currentMileage: moto.currentMileage, mileageThreshold, items: records },
  })
}

// ── PUT /api/maintenance-logs/:id ─────────────────────────────────────────

export async function updateMaintenanceLog(req: Request, res: Response) {
  const userId = req.user!.userId
  const { id } = req.params

  const existing = await prisma.maintenanceRecord.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ success: false, message: '기록을 찾을 수 없습니다.' })
    return
  }
  if (!(await assertOwnership(existing.motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const { date, mileage, category, title, description, cost, shop, shopId, nextMileage, nextDate, note } = req.body

  const updated = await prisma.maintenanceRecord.update({
    where: { id },
    data: {
      ...(date != null && { date: new Date(date) }),
      ...(mileage != null && { mileage: Number(mileage) }),
      ...(category != null && { category }),
      ...(title != null && { title }),
      ...(description !== undefined && { description }),
      ...(cost != null && { cost: Number(cost) }),
      ...(shop !== undefined && { shop }),
      ...(shopId !== undefined && { shopId }),
      ...(nextMileage !== undefined && { nextMileage: nextMileage != null ? Number(nextMileage) : null }),
      ...(nextDate !== undefined && { nextDate: nextDate ? new Date(nextDate) : null }),
      ...(note !== undefined && { note }),
    },
  })

  res.json({ success: true, data: updated })
}

// ── DELETE /api/maintenance-logs/:id ─────────────────────────────────────

export async function deleteMaintenanceLog(req: Request, res: Response) {
  const userId = req.user!.userId
  const { id } = req.params

  const existing = await prisma.maintenanceRecord.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ success: false, message: '기록을 찾을 수 없습니다.' })
    return
  }
  if (!(await assertOwnership(existing.motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  await prisma.maintenanceRecord.delete({ where: { id } })
  res.json({ success: true, data: null, message: '삭제되었습니다.' })
}
