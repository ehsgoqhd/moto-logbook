import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import authRouter from './routes/auth'
import motorcyclesRouter from './routes/motorcycles'
import fuelLogsRouter from './routes/fuelLogs'
import maintenanceLogsRouter from './routes/maintenanceLogs'
import insuranceTaxesRouter from './routes/insuranceTaxes'
import { startNotificationJob } from './jobs/notificationJob'

const app = express()
const PORT = process.env.PORT ?? 4000

// ── Security ──────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

// ── Body parsing ──────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API routes ────────────────────────────
app.get('/api', (_req, res) => {
  res.json({ message: 'Moto Logbook API v1' })
})

app.use('/api/auth', authRouter)
app.use('/api/motorcycles', motorcyclesRouter)
app.use('/api/fuel-logs', fuelLogsRouter)
app.use('/api/maintenance-logs', maintenanceLogsRouter)
app.use('/api/insurance-taxes', insuranceTaxesRouter)

// ── 404 handler ───────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Global error handler ──────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`🏍  Moto Logbook API running on http://localhost:${PORT}`)
  startNotificationJob()
})

export default app
