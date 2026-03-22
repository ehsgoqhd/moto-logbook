import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// ── Helpers ───────────────────────────────────────────────────────────────

async function assertOwnership(motorcycleId: string, userId: string): Promise<boolean> {
  const moto = await prisma.motorcycle.findFirst({ where: { id: motorcycleId, userId } })
  return !!moto
}

/** km/L: (currentMileage - prevMileage) / liters. Returns null if no prior record. */
async function calcEfficiency(
  motorcycleId: string,
  currentMileage: number,
  currentLiters: number,
): Promise<number | null> {
  const prev = await prisma.fuelRecord.findFirst({
    where: { motorcycleId, mileage: { lt: currentMileage } },
    orderBy: { mileage: 'desc' },
    select: { mileage: true },
  })
  if (!prev || prev.mileage >= currentMileage) return null
  const dist = currentMileage - prev.mileage
  return Math.round((dist / currentLiters) * 10) / 10
}

// ── POST /api/fuel-logs ───────────────────────────────────────────────────

export async function createFuelLog(req: Request, res: Response) {
  const userId = req.user!.userId
  const { motorcycleId, date, mileage, liters, pricePerLiter, totalCost, fullTank, station, fuelType, note } = req.body

  if (!motorcycleId || !date || mileage == null || liters == null || pricePerLiter == null || totalCost == null) {
    res.status(400).json({ success: false, message: '필수 항목이 누락되었습니다. (motorcycleId, date, mileage, liters, pricePerLiter, totalCost)' })
    return
  }

  if (!(await assertOwnership(motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const record = await prisma.fuelRecord.create({
    data: {
      motorcycleId,
      date: new Date(date),
      mileage: Number(mileage),
      liters: Number(liters),
      pricePerLiter: Number(pricePerLiter),
      totalCost: Number(totalCost),
      fullTank: fullTank ?? true,
      station: station ?? null,
      fuelType: fuelType ?? 'GASOLINE',
      note: note ?? null,
    },
  })

  const fuelEfficiency = await calcEfficiency(motorcycleId, record.mileage, record.liters)
  res.status(201).json({ success: true, data: { ...record, fuelEfficiency } })
}

// ── GET /api/fuel-logs ────────────────────────────────────────────────────

export async function getFuelLogs(req: Request, res: Response) {
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

  const [records, total] = await Promise.all([
    prisma.fuelRecord.findMany({
      where: { motorcycleId: motorcycleId as string },
      orderBy: { date: 'desc' },
      take,
      skip,
    }),
    prisma.fuelRecord.count({ where: { motorcycleId: motorcycleId as string } }),
  ])

  const items = await Promise.all(
    records.map(async (r) => ({
      ...r,
      fuelEfficiency: await calcEfficiency(r.motorcycleId, r.mileage, r.liters),
    })),
  )

  res.json({
    success: true,
    data: { items, total, page: Number(page), totalPages: Math.ceil(total / take) },
  })
}

// ── GET /api/fuel-logs/stats ──────────────────────────────────────────────

export async function getFuelStats(req: Request, res: Response) {
  const userId = req.user!.userId
  const { motorcycleId } = req.query

  if (!motorcycleId) {
    res.status(400).json({ success: false, message: 'motorcycleId 쿼리 파라미터가 필요합니다.' })
    return
  }

  if (!(await assertOwnership(motorcycleId as string, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const records = await prisma.fuelRecord.findMany({
    where: { motorcycleId: motorcycleId as string },
    orderBy: { mileage: 'asc' },
  })

  // 평균 연비: 연속 기록 간 (마일리지 차이 / 주유량) 평균
  let effSum = 0
  let effCount = 0
  for (let i = 1; i < records.length; i++) {
    const dist = records[i].mileage - records[i - 1].mileage
    if (dist > 0) {
      effSum += dist / records[i].liters
      effCount++
    }
  }
  const avgEfficiency = effCount > 0 ? Math.round((effSum / effCount) * 10) / 10 : null

  // 이번달 주유비
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthCost = records
    .filter((r) => new Date(r.date) >= startOfMonth)
    .reduce((sum, r) => sum + r.totalCost, 0)

  // 최근 6개월 월별 통계
  const monthlyCosts = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthRecords = records.filter((r) => {
      const rd = new Date(r.date)
      return rd >= d && rd < end
    })
    return {
      month,
      cost: monthRecords.reduce((sum, r) => sum + r.totalCost, 0),
      liters: Math.round(monthRecords.reduce((sum, r) => sum + r.liters, 0) * 10) / 10,
    }
  })

  res.json({ success: true, data: { avgEfficiency, thisMonthCost, monthlyCosts } })
}

// ── PUT /api/fuel-logs/:id ────────────────────────────────────────────────

export async function updateFuelLog(req: Request, res: Response) {
  const userId = req.user!.userId
  const { id } = req.params

  const existing = await prisma.fuelRecord.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ success: false, message: '기록을 찾을 수 없습니다.' })
    return
  }

  if (!(await assertOwnership(existing.motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  const { date, mileage, liters, pricePerLiter, totalCost, fullTank, station, fuelType, note } = req.body

  const updated = await prisma.fuelRecord.update({
    where: { id },
    data: {
      ...(date != null && { date: new Date(date) }),
      ...(mileage != null && { mileage: Number(mileage) }),
      ...(liters != null && { liters: Number(liters) }),
      ...(pricePerLiter != null && { pricePerLiter: Number(pricePerLiter) }),
      ...(totalCost != null && { totalCost: Number(totalCost) }),
      ...(fullTank != null && { fullTank }),
      ...(station !== undefined && { station }),
      ...(fuelType != null && { fuelType }),
      ...(note !== undefined && { note }),
    },
  })

  const fuelEfficiency = await calcEfficiency(updated.motorcycleId, updated.mileage, updated.liters)
  res.json({ success: true, data: { ...updated, fuelEfficiency } })
}

// ── DELETE /api/fuel-logs/:id ─────────────────────────────────────────────

export async function deleteFuelLog(req: Request, res: Response) {
  const userId = req.user!.userId
  const { id } = req.params

  const existing = await prisma.fuelRecord.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ success: false, message: '기록을 찾을 수 없습니다.' })
    return
  }

  if (!(await assertOwnership(existing.motorcycleId, userId))) {
    res.status(403).json({ success: false, message: '접근 권한이 없습니다.' })
    return
  }

  await prisma.fuelRecord.delete({ where: { id } })
  res.json({ success: true, data: null, message: '삭제되었습니다.' })
}
