import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import {
  createFuelLog,
  getFuelLogs,
  getFuelStats,
  updateFuelLog,
  deleteFuelLog,
} from '../controllers/fuelLogController'

const router = Router()

router.use(authenticate)

// /stats must be declared before /:id to avoid "stats" being parsed as an id
router.get('/stats', getFuelStats)

router.post('/', createFuelLog)
router.get('/', getFuelLogs)
router.put('/:id', updateFuelLog)
router.delete('/:id', deleteFuelLog)

export default router
