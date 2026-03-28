import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// ── GET /api/motorcycles ───────────────────────────────────────────────────

export async function getMotorcycles(req: Request, res: Response) {
  const userId = req.user!.userId

  const motorcycles = await prisma.motorcycle.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })

  res.json({ success: true, data: motorcycles })
}

// ── GET /api/motorcycles/:id ───────────────────────────────────────────────

export async function getMotorcycle(req: Request, res: Response) {
  const userId = req.user!.userId
  const id = req.params.id as string

  const motorcycle = await prisma.motorcycle.findFirst({ where: { id, userId } })
  if (!motorcycle) {
    res.status(404).json({ success: false, message: '오토바이를 찾을 수 없습니다.' })
    return
  }

  res.json({ success: true, data: motorcycle })
}

// ── POST /api/motorcycles ─────────────────────────────────────────────────

export async function createMotorcycle(req: Request, res: Response) {
  const userId = req.user!.userId
  const {
    name, brand, model, year, engineCC, plateNumber,
    vin, color, purchaseDate, purchaseMileage, currentMileage, imageUrl,
  } = req.body as Record<string, any>

  if (!name || !brand || !model || !year) {
    res.status(400).json({ success: false, message: '필수 항목 누락 (name, brand, model, year)' })
    return
  }

  const motorcycle = await prisma.motorcycle.create({
    data: {
      userId,
      name,
      brand,
      model,
      year: Number(year),
      engineCC: engineCC != null ? Number(engineCC) : null,
      plateNumber: plateNumber ?? null,
      vin: vin ?? null,
      color: color ?? null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchaseMileage: purchaseMileage != null ? Number(purchaseMileage) : 0,
      currentMileage: currentMileage != null ? Number(currentMileage) : 0,
      imageUrl: imageUrl ?? null,
    },
  })

  res.status(201).json({ success: true, data: motorcycle })
}

// ── PUT /api/motorcycles/:id ──────────────────────────────────────────────

export async function updateMotorcycle(req: Request, res: Response) {
  const userId = req.user!.userId
  const id = req.params.id as string

  const existing = await prisma.motorcycle.findFirst({ where: { id, userId } })
  if (!existing) {
    res.status(404).json({ success: false, message: '오토바이를 찾을 수 없습니다.' })
    return
  }

  const {
    name, brand, model, year, engineCC, plateNumber,
    vin, color, purchaseDate, purchaseMileage, currentMileage, imageUrl, isActive,
  } = req.body as Record<string, any>

  const motorcycle = await prisma.motorcycle.update({
    where: { id },
    data: {
      ...(name != null && { name }),
      ...(brand != null && { brand }),
      ...(model != null && { model }),
      ...(year != null && { year: Number(year) }),
      ...(engineCC !== undefined && { engineCC: engineCC != null ? Number(engineCC) : null }),
      ...(plateNumber !== undefined && { plateNumber }),
      ...(vin !== undefined && { vin }),
      ...(color !== undefined && { color }),
      ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
      ...(purchaseMileage != null && { purchaseMileage: Number(purchaseMileage) }),
      ...(currentMileage != null && { currentMileage: Number(currentMileage) }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isActive != null && { isActive }),
    },
  })

  res.json({ success: true, data: motorcycle })
}

// ── DELETE /api/motorcycles/:id ───────────────────────────────────────────

export async function deleteMotorcycle(req: Request, res: Response) {
  const userId = req.user!.userId
  const id = req.params.id as string

  const existing = await prisma.motorcycle.findFirst({ where: { id, userId } })
  if (!existing) {
    res.status(404).json({ success: false, message: '오토바이를 찾을 수 없습니다.' })
    return
  }

  await prisma.motorcycle.delete({ where: { id } })
  res.json({ success: true, data: null, message: '삭제되었습니다.' })
}
