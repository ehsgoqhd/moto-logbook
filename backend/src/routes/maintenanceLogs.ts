import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import {
  createMaintenanceLog,
  getMaintenanceLogs,
  getUpcomingMaintenance,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from '../controllers/maintenanceLogController'

const router = Router()

router.use(authenticate)

// /upcoming must be declared before /:id
router.get('/upcoming', getUpcomingMaintenance)

router.post('/', createMaintenanceLog)
router.get('/', getMaintenanceLogs)
router.put('/:id', updateMaintenanceLog)
router.delete('/:id', deleteMaintenanceLog)

export default router
