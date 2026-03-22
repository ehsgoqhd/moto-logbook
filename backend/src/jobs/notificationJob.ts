import cron from 'node-cron'
import { prisma } from '../lib/prisma'

// ── Maintenance upcoming check ────────────────────────────────────────────

async function checkUpcomingMaintenance() {
  const motorcycles = await prisma.motorcycle.findMany({
    where: { isActive: true },
    select: { id: true, userId: true, name: true, currentMileage: true },
  })

  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

  for (const moto of motorcycles) {
    const mileageThreshold = moto.currentMileage + 500

    const upcoming = await prisma.maintenanceRecord.findMany({
      where: {
        motorcycleId: moto.id,
        OR: [
          { nextMileage: { lte: mileageThreshold } },
          { nextDate: { lte: sevenDaysLater } },
        ],
      },
      select: { id: true, title: true, category: true, nextMileage: true, nextDate: true },
    })

    if (upcoming.length > 0) {
      console.log(
        `[notificationJob] 정비 임박 — userId: ${moto.userId} | 차량: ${moto.name} | ${upcoming.length}개 항목`,
      )
      for (const item of upcoming) {
        console.log(`  • [${item.category}] ${item.title} — nextKm: ${item.nextMileage ?? '-'}, nextDate: ${item.nextDate?.toISOString().slice(0, 10) ?? '-'}`)
      }
      // TODO: sendWebPush(moto.userId, {
      //   title: '🔧 정비 교체 임박',
      //   body: `${moto.name}: ${upcoming.map(i => i.title).join(', ')}`,
      //   data: { type: 'MAINTENANCE_DUE', motorcycleId: moto.id },
      // })
    }
  }
}

// ── Insurance / Tax expiring check ───────────────────────────────────────

async function checkExpiringInsuranceTaxes() {
  const thirtyDaysLater = new Date()
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

  const expiring = await prisma.expenseRecord.findMany({
    where: {
      category: { in: ['INSURANCE', 'REGISTRATION', 'TAX'] as any[] },
      expiryDate: { lte: thirtyDaysLater },
    },
    include: {
      motorcycle: { select: { userId: true, name: true } },
    },
    orderBy: { expiryDate: 'asc' },
  })

  // Group by userId
  const byUser = new Map<string, typeof expiring>()
  for (const record of expiring) {
    const uid = record.motorcycle.userId
    if (!byUser.has(uid)) byUser.set(uid, [])
    byUser.get(uid)!.push(record)
  }

  for (const [userId, records] of byUser) {
    console.log(
      `[notificationJob] 보험/세금 만료 임박 — userId: ${userId} | ${records.length}개 항목`,
    )
    for (const rec of records) {
      console.log(
        `  • [${rec.category}] ${rec.title} — 만료: ${rec.expiryDate?.toISOString().slice(0, 10) ?? '-'} (${rec.motorcycle.name})`,
      )
    }
    // TODO: sendWebPush(userId, {
    //   title: '📋 보험/세금 만료 임박',
    //   body: `${records.length}개 항목이 30일 내에 만료됩니다.`,
    //   data: { type: 'EXPENSE_EXPIRING' },
    // })
  }
}

// ── Job runner ────────────────────────────────────────────────────────────

async function runNotifications() {
  console.log(`[notificationJob] 실행 시작 — ${new Date().toISOString()}`)
  try {
    await checkUpcomingMaintenance()
    await checkExpiringInsuranceTaxes()
  } catch (err) {
    console.error('[notificationJob] 오류:', err)
  }
  console.log(`[notificationJob] 완료`)
}

export function startNotificationJob() {
  // 매일 오전 9시 (KST) 실행
  cron.schedule('0 9 * * *', runNotifications, { timezone: 'Asia/Seoul' })
  console.log('[notificationJob] 스케줄 등록 완료 — 매일 09:00 KST')
}

/** 즉시 1회 실행 (개발/테스트용) */
export { runNotifications as runNotificationJobNow }
