import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// ── GET /api/shops ─────────────────────────────────────────────────────────

export async function getShops(req: Request, res: Response) {
  const { brand } = req.query

  const shops = await prisma.repairShop.findMany({
    include: {
      specialties: {
        select: { id: true, brand: true, category: true },
      },
    },
    where: brand
      ? { specialties: { some: { brand: { contains: brand as string, mode: 'insensitive' } } } }
      : undefined,
    orderBy: [{ isRecommended: 'desc' }, { name: 'asc' }],
  })

  res.json({ success: true, data: shops })
}

// ── GET /api/shops/:id ─────────────────────────────────────────────────────

export async function getShop(req: Request, res: Response) {
  const { id } = req.params

  const shop = await prisma.repairShop.findUnique({
    where: { id },
    include: {
      specialties: {
        select: { id: true, brand: true, category: true },
      },
    },
  })

  if (!shop) {
    res.status(404).json({ success: false, message: '정비샵을 찾을 수 없습니다.' })
    return
  }

  res.json({ success: true, data: shop })
}
