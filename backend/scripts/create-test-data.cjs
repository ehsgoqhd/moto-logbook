'use strict'
// One-time script to create test motorcycle for manual testing
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

async function main() {
  // Patch marker check happens via postinstall, assume wasm.js is already patched
  const { PrismaClient } = require('@prisma/client/wasm')
  const { PrismaPg } = require('@prisma/adapter-pg')
  const { Pool } = require('pg')

  const pool = new Pool({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  const userId = process.argv[2]
  if (!userId) { console.error('Usage: node create-test-data.cjs <userId>'); process.exit(1) }

  const moto = await prisma.motorcycle.upsert({
    where: { id: 'test_moto_001' },
    update: {},
    create: {
      id: 'test_moto_001',
      userId,
      name: '내 CBR500R',
      brand: 'Honda',
      model: 'CBR500R',
      year: 2023,
      purchaseMileage: 0,
      currentMileage: 0,
    },
  })
  console.log('Motorcycle:', moto.id, moto.name)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
